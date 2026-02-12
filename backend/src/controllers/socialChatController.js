import Conversation from '../models/Conversation.js'
import Message from '../models/Message.js'
import User from '../models/User.js'
import { isBlockedBetween, emitToUser, createNotification } from '../utils/socialHelpers.js'

const idEquals = (a, b) => `${a}` === `${b}`

const getOtherParticipant = (participants, userId) =>
  participants.find((id) => !idEquals(id, userId))

export const getOrCreateConversation = async (req, res) => {
  try {
    const targetId = req.params.userId
    if (!targetId || idEquals(targetId, req.user.id)) {
      return res.status(400).json({ message: 'Invalid user target' })
    }

    const [user, target] = await Promise.all([
      User.findById(req.user.id),
      User.findById(targetId)
    ])

    if (!target) {
      return res.status(404).json({ message: 'User not found' })
    }

    if (isBlockedBetween(user, target)) {
      return res.status(403).json({ message: 'Messaging not allowed with blocked user' })
    }

    if (!(user.friends || []).some((id) => idEquals(id, target._id))) {
      return res.status(403).json({ message: 'You can only message friends' })
    }

    let conversation = await Conversation.findOne({
      participants: { $all: [user._id, target._id] }
    })

    if (!conversation) {
      conversation = await Conversation.create({ participants: [user._id, target._id] })
    }

    res.json({ conversation })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

export const listConversations = async (req, res) => {
  try {
    const conversations = await Conversation.find({ participants: req.user.id })
      .populate('participants', 'name username profilePic')
      .sort({ updatedAt: -1 })

    res.json({ conversations })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

export const getMessages = async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query
    const conversation = await Conversation.findById(req.params.conversationId)

    if (!conversation) {
      return res.status(404).json({ message: 'Conversation not found' })
    }

    if (!conversation.participants.some((id) => idEquals(id, req.user.id))) {
      return res.status(403).json({ message: 'Not authorized' })
    }

    const otherUserId = getOtherParticipant(conversation.participants, req.user.id)
    const [viewer, otherUser] = await Promise.all([
      User.findById(req.user.id),
      User.findById(otherUserId)
    ])

    if (!viewer?.friends?.some((id) => idEquals(id, otherUserId))) {
      return res.status(403).json({ message: 'You can only view conversations with friends' })
    }

    if (isBlockedBetween(viewer, otherUser)) {
      return res.status(403).json({ message: 'Messaging not allowed with blocked user' })
    }

    const messages = await Message.find({ conversationId: conversation._id })
      .populate('sender', 'name username profilePic')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit))

    res.json({
      messages: messages.reverse(),
      page: Number(page),
      limit: Number(limit),
      hasMore: messages.length === Number(limit)
    })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

export const sendMessage = async (req, res) => {
  try {
    const { text = '', mediaUrl = '' } = req.body
    const conversation = await Conversation.findById(req.params.conversationId)

    if (!conversation) {
      return res.status(404).json({ message: 'Conversation not found' })
    }

    if (!conversation.participants.some((id) => idEquals(id, req.user.id))) {
      return res.status(403).json({ message: 'Not authorized' })
    }

    if (!text.trim() && !mediaUrl) {
      return res.status(400).json({ message: 'Message cannot be empty' })
    }

    const [user, otherUser] = await Promise.all([
      User.findById(req.user.id),
      User.findById(otherUserId)
    ])

    if (!user?.friends?.some((id) => idEquals(id, otherUserId))) {
      return res.status(403).json({ message: 'You can only message friends' })
    }

    if (isBlockedBetween(user, otherUser)) {
      return res.status(403).json({ message: 'Messaging not allowed with blocked user' })
    }

    const message = await Message.create({
      conversationId: conversation._id,
      sender: req.user.id,
      text: text.trim(),
      mediaUrl,
      seenBy: [req.user.id]
    })

    conversation.lastMessage = text.trim() || 'Media'
    conversation.lastMessageAt = new Date()
    await conversation.save()

    const io = req.app.get('io')
    if (io) {
      emitToUser(io, otherUserId, 'chat_message', {
        conversationId: conversation._id,
        message
      })
      await createNotification({
        userId: otherUserId,
        fromUserId: req.user.id,
        type: 'message',
        referenceId: conversation._id
      }, io)
    }

    res.status(201).json({ message })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

export const markSeen = async (req, res) => {
  try {
    const conversation = await Conversation.findById(req.params.conversationId)
    if (!conversation) {
      return res.status(404).json({ message: 'Conversation not found' })
    }

    if (!conversation.participants.some((id) => idEquals(id, req.user.id))) {
      return res.status(403).json({ message: 'Not authorized' })
    }

    await Message.updateMany(
      { conversationId: conversation._id, seenBy: { $ne: req.user.id } },
      { $addToSet: { seenBy: req.user.id } }
    )

    const io = req.app.get('io')
    if (io) {
      const otherUserId = getOtherParticipant(conversation.participants, req.user.id)
      emitToUser(io, otherUserId, 'message_seen', {
        conversationId: conversation._id,
        userId: req.user.id
      })
    }

    res.json({ message: 'Messages marked as seen' })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}
