import FriendRequest from '../models/FriendRequest.js'
import User from '../models/User.js'
import { createNotification, emitToUser, isBlockedBetween } from '../utils/socialHelpers.js'

const idEquals = (a, b) => `${a}` === `${b}`

export const sendFriendRequest = async (req, res) => {
  try {
    const targetId = req.params.userId
    if (!targetId || idEquals(targetId, req.user.id)) {
      return res.status(400).json({ message: 'Invalid user target' })
    }

    const [sender, receiver] = await Promise.all([
      User.findById(req.user.id),
      User.findById(targetId)
    ])

    if (!receiver) {
      return res.status(404).json({ message: 'User not found' })
    }

    if (isBlockedBetween(sender, receiver)) {
      return res.status(403).json({ message: 'Action not allowed with blocked user' })
    }

    if ((sender.friends || []).some((id) => idEquals(id, receiver._id))) {
      return res.status(400).json({ message: 'Already friends' })
    }

    const existing = await FriendRequest.findOne({
      $or: [
        { sender: sender._id, receiver: receiver._id },
        { sender: receiver._id, receiver: sender._id }
      ]
    })

    if (existing) {
      if (existing.status === 'pending') {
        return res.status(400).json({ message: 'Friend request already pending' })
      }
      if (existing.status === 'accepted') {
        return res.status(400).json({ message: 'Already friends' })
      }
      if (existing.status === 'blocked') {
        return res.status(403).json({ message: 'Action not allowed with blocked user' })
      }
      await FriendRequest.deleteOne({ _id: existing._id })
    }

    const request = await FriendRequest.create({
      sender: sender._id,
      receiver: receiver._id,
      status: 'pending'
    })

    const io = req.app.get('io')
    await createNotification({
      userId: receiver._id,
      fromUserId: sender._id,
      type: 'friend_request',
      referenceId: request._id
    }, io)

    if (io) {
      emitToUser(io, receiver._id, 'friend_request', {
        requestId: request._id,
        senderId: sender._id
      })
    }

    res.status(201).json({ message: 'Friend request sent', request })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

export const acceptFriendRequest = async (req, res) => {
  try {
    const request = await FriendRequest.findById(req.params.requestId)
    if (!request) {
      return res.status(404).json({ message: 'Request not found' })
    }

    if (!idEquals(request.receiver, req.user.id)) {
      return res.status(403).json({ message: 'Not authorized to accept this request' })
    }

    if (request.status !== 'pending') {
      return res.status(400).json({ message: 'Request is not pending' })
    }

    request.status = 'accepted'
    await request.save()

    await User.updateOne({ _id: request.sender }, { $addToSet: { friends: request.receiver } })
    await User.updateOne({ _id: request.receiver }, { $addToSet: { friends: request.sender } })

    const io = req.app.get('io')
    if (io) {
      emitToUser(io, request.sender, 'friend_update', { userId: request.receiver })
      emitToUser(io, request.receiver, 'friend_update', { userId: request.sender })
      await createNotification({
        userId: request.sender,
        fromUserId: request.receiver,
        type: 'friend_request',
        referenceId: request._id
      }, io)
    }

    res.json({ message: 'Friend request accepted' })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

export const rejectFriendRequest = async (req, res) => {
  try {
    const request = await FriendRequest.findById(req.params.requestId)
    if (!request) {
      return res.status(404).json({ message: 'Request not found' })
    }

    if (!idEquals(request.receiver, req.user.id)) {
      return res.status(403).json({ message: 'Not authorized to reject this request' })
    }

    if (request.status !== 'pending') {
      return res.status(400).json({ message: 'Request is not pending' })
    }

    request.status = 'rejected'
    await request.save()

    res.json({ message: 'Friend request rejected' })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

export const cancelFriendRequest = async (req, res) => {
  try {
    const request = await FriendRequest.findById(req.params.requestId)
    if (!request) {
      return res.status(404).json({ message: 'Request not found' })
    }

    if (!idEquals(request.sender, req.user.id)) {
      return res.status(403).json({ message: 'Not authorized to cancel this request' })
    }

    if (request.status !== 'pending') {
      return res.status(400).json({ message: 'Request is not pending' })
    }

    await FriendRequest.deleteOne({ _id: request._id })
    res.json({ message: 'Friend request cancelled' })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

export const removeFriend = async (req, res) => {
  try {
    const targetId = req.params.userId
    await User.updateOne({ _id: req.user.id }, { $pull: { friends: targetId } })
    await User.updateOne({ _id: targetId }, { $pull: { friends: req.user.id } })

    res.json({ message: 'Friend removed' })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

export const blockUser = async (req, res) => {
  try {
    const targetId = req.params.userId
    if (idEquals(targetId, req.user.id)) {
      return res.status(400).json({ message: 'Cannot block yourself' })
    }

    await User.updateOne({ _id: req.user.id }, { $addToSet: { blockedUsers: targetId }, $pull: { friends: targetId } })
    await User.updateOne({ _id: targetId }, { $pull: { friends: req.user.id } })

    await FriendRequest.findOneAndUpdate(
      { sender: req.user.id, receiver: targetId },
      { status: 'blocked' },
      { upsert: true, new: true }
    )

    await FriendRequest.deleteMany({
      $or: [
        { sender: targetId, receiver: req.user.id },
        { sender: req.user.id, receiver: targetId, status: { $ne: 'blocked' } }
      ]
    })

    res.json({ message: 'User blocked' })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

export const unblockUser = async (req, res) => {
  try {
    const targetId = req.params.userId
    await User.updateOne({ _id: req.user.id }, { $pull: { blockedUsers: targetId } })
    await FriendRequest.deleteMany({ sender: req.user.id, receiver: targetId, status: 'blocked' })
    res.json({ message: 'User unblocked' })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

export const getFriends = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).populate('friends', 'name username email profilePic')
    res.json({ friends: user?.friends || [] })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

export const getFriendRequests = async (req, res) => {
  try {
    const type = req.query.type || 'received'
    const query = type === 'sent'
      ? { sender: req.user.id, status: 'pending' }
      : { receiver: req.user.id, status: 'pending' }

    const requests = await FriendRequest.find(query)
      .populate('sender', 'name username profilePic')
      .populate('receiver', 'name username profilePic')
      .sort({ createdAt: -1 })

    res.json({ requests })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

export const getBlockedUsers = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).populate('blockedUsers', 'name username email profilePic')
    res.json({ blockedUsers: user?.blockedUsers || [] })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

export const searchUsers = async (req, res) => {
  try {
    const query = (req.query.q || '').trim()
    if (!query) {
      return res.json({ users: [] })
    }

    const currentUser = await User.findById(req.user.id).select('blockedUsers friends')
    const blockedIds = currentUser.blockedUsers || []

    const users = await User.find({
      _id: { $ne: req.user.id, $nin: blockedIds },
      $or: [
        { username: { $regex: query, $options: 'i' } },
        { name: { $regex: query, $options: 'i' } },
        { email: { $regex: query, $options: 'i' } }
      ]
    })
      .select('name username email profilePic')
      .limit(10)

    res.json({ users })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}
