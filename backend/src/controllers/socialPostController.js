import Post from '../models/Post.js'
import SocialComment from '../models/SocialComment.js'
import User from '../models/User.js'
import { createNotification, isBlockedBetween } from '../utils/socialHelpers.js'

const idEquals = (a, b) => `${a}` === `${b}`

const canViewUserPosts = (viewer, owner) => {
  if (idEquals(viewer._id, owner._id)) return true
  const isFriend = (viewer.friends || []).some((id) => idEquals(id, owner._id))
  return isFriend
}

export const createPost = async (req, res) => {
  try {
    const { caption = '', visibility = 'friends' } = req.body
    const safeVisibility = ['friends', 'public'].includes(visibility) ? visibility : 'friends'
    const mediaUrl = req.file ? `/uploads/${req.file.filename}` : ''
    const mediaType = req.file
      ? (req.file.mimetype.startsWith('video/') ? 'video' : 'image')
      : 'none'

    if (!caption.trim() && !mediaUrl) {
      return res.status(400).json({ message: 'Post must include text or media' })
    }

    const post = await Post.create({
      user: req.user.id,
      caption: caption.trim(),
      mediaUrl,
      mediaType,
      visibility: safeVisibility
    })

    const io = req.app.get('io')
    if (io) {
      const author = await User.findById(req.user.id).select('friends')
      const targets = [req.user.id, ...(author?.friends || [])]
      targets.forEach((id) => io.to(`user:${id}`).emit('social_post_update', { postId: post._id }))
    }

    res.status(201).json({ post })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

export const getFeed = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query
    const viewer = await User.findById(req.user.id)

    const blockedIds = viewer.blockedUsers || []
    const blockedBy = await User.find({ blockedUsers: req.user.id }).select('_id')
    const blockedByIds = blockedBy.map((u) => u._id)

    const friendIds = viewer.friends || []
    const visibilityQuery = {
      $or: [
        { user: { $in: [viewer._id, ...friendIds] }, visibility: 'friends' },
        { visibility: 'public' }
      ]
    }

    const posts = await Post.find({
      ...visibilityQuery,
      user: { $nin: [...blockedIds, ...blockedByIds] }
    })
      .populate('user', 'name username profilePic')
      .populate({
        path: 'comments',
        populate: { path: 'user', select: 'name username profilePic' },
        options: { sort: { createdAt: -1 }, limit: 3 }
      })
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit))

    res.json({
      posts,
      page: Number(page),
      limit: Number(limit),
      hasMore: posts.length === Number(limit)
    })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

export const getUserPosts = async (req, res) => {
  try {
    const targetId = req.params.userId
    const [viewer, owner] = await Promise.all([
      User.findById(req.user.id),
      User.findById(targetId)
    ])

    if (!owner) {
      return res.status(404).json({ message: 'User not found' })
    }

    if (isBlockedBetween(viewer, owner)) {
      return res.status(403).json({ message: 'Not allowed to view this profile' })
    }

    const canView = canViewUserPosts(viewer, owner)
    const query = canView
      ? { user: owner._id }
      : { user: owner._id, visibility: 'public' }

    const posts = await Post.find(query)
      .populate('user', 'name username profilePic')
      .populate({
        path: 'comments',
        populate: { path: 'user', select: 'name username profilePic' },
        options: { sort: { createdAt: -1 } }
      })
      .sort({ createdAt: -1 })

    res.json({ posts })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

export const toggleLike = async (req, res) => {
  try {
    const post = await Post.findById(req.params.postId).populate('user')
    if (!post) {
      return res.status(404).json({ message: 'Post not found' })
    }

    const viewer = await User.findById(req.user.id)
    if (isBlockedBetween(viewer, post.user)) {
      return res.status(403).json({ message: 'Not allowed to interact with this post' })
    }

    const hasLiked = post.likes.some((id) => idEquals(id, req.user.id))
    if (hasLiked) {
      post.likes = post.likes.filter((id) => !idEquals(id, req.user.id))
    } else {
      post.likes.push(req.user.id)
      post.dislikes = post.dislikes.filter((id) => !idEquals(id, req.user.id))

      if (!idEquals(post.user._id, req.user.id)) {
        await createNotification({
          userId: post.user._id,
          fromUserId: req.user.id,
          type: 'like',
          referenceId: post._id
        }, req.app.get('io'))
      }
    }

    await post.save()

    const io = req.app.get('io')
    if (io) {
      io.to(`user:${post.user._id}`).emit('social_post_update', { postId: post._id })
    }
    res.json({ likes: post.likes.length, dislikes: post.dislikes.length })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

export const toggleDislike = async (req, res) => {
  try {
    const post = await Post.findById(req.params.postId).populate('user')
    if (!post) {
      return res.status(404).json({ message: 'Post not found' })
    }

    const viewer = await User.findById(req.user.id)
    if (isBlockedBetween(viewer, post.user)) {
      return res.status(403).json({ message: 'Not allowed to interact with this post' })
    }

    const hasDisliked = post.dislikes.some((id) => idEquals(id, req.user.id))
    if (hasDisliked) {
      post.dislikes = post.dislikes.filter((id) => !idEquals(id, req.user.id))
    } else {
      post.dislikes.push(req.user.id)
      post.likes = post.likes.filter((id) => !idEquals(id, req.user.id))
    }

    await post.save()

    const io = req.app.get('io')
    if (io) {
      io.to(`user:${post.user._id}`).emit('social_post_update', { postId: post._id })
    }
    res.json({ likes: post.likes.length, dislikes: post.dislikes.length })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

export const addComment = async (req, res) => {
  try {
    const post = await Post.findById(req.params.postId).populate('user')
    if (!post) {
      return res.status(404).json({ message: 'Post not found' })
    }

    const viewer = await User.findById(req.user.id)
    if (isBlockedBetween(viewer, post.user)) {
      return res.status(403).json({ message: 'Not allowed to comment on this post' })
    }

    const text = (req.body.text || '').trim()
    if (!text) {
      return res.status(400).json({ message: 'Comment cannot be empty' })
    }

    const comment = await SocialComment.create({
      user: req.user.id,
      postId: post._id,
      text
    })

    post.comments.push(comment._id)
    await post.save()

    const io = req.app.get('io')
    if (io) {
      io.to(`user:${post.user._id}`).emit('social_post_update', { postId: post._id })
    }

    if (!idEquals(post.user._id, req.user.id)) {
      await createNotification({
        userId: post.user._id,
        fromUserId: req.user.id,
        type: 'comment',
        referenceId: post._id
      }, req.app.get('io'))
    }

    res.status(201).json({ comment })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

export const deleteComment = async (req, res) => {
  try {
    const comment = await SocialComment.findById(req.params.commentId)
    if (!comment) {
      return res.status(404).json({ message: 'Comment not found' })
    }

    if (!idEquals(comment.user, req.user.id)) {
      return res.status(403).json({ message: 'Not authorized to delete this comment' })
    }

    await Post.updateOne({ _id: comment.postId }, { $pull: { comments: comment._id } })
    await SocialComment.deleteOne({ _id: comment._id })

    res.json({ message: 'Comment deleted' })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

export const deletePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.postId)
    if (!post) {
      return res.status(404).json({ message: 'Post not found' })
    }

    if (!idEquals(post.user, req.user.id)) {
      return res.status(403).json({ message: 'Not authorized to delete this post' })
    }

    await SocialComment.deleteMany({ postId: post._id })
    await Post.deleteOne({ _id: post._id })

    const io = req.app.get('io')
    if (io) {
      io.to(`user:${req.user.id}`).emit('social_post_update', { postId: post._id, deleted: true })
    }

    res.json({ message: 'Post deleted' })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}
