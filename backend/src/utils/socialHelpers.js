import Notification from '../models/Notification.js'

export const isBlockedBetween = (user, targetUser) => {
  if (!user || !targetUser) return false
  const userBlocked = (user.blockedUsers || []).some((id) => `${id}` === `${targetUser._id}`)
  const targetBlocked = (targetUser.blockedUsers || []).some((id) => `${id}` === `${user._id}`)
  return userBlocked || targetBlocked
}

export const emitToUser = (io, userId, event, payload) => {
  if (!io || !userId) return
  io.to(`user:${userId}`).emit(event, payload)
}

export const createNotification = async ({ userId, fromUserId, type, referenceId }, io) => {
  if (!userId || !type) return null
  const notification = await Notification.create({
    user: userId,
    fromUser: fromUserId,
    type,
    referenceId
  })

  if (io) {
    emitToUser(io, userId, 'notification', {
      id: notification._id,
      type: notification.type,
      fromUser: notification.fromUser,
      referenceId: notification.referenceId,
      createdAt: notification.createdAt
    })
  }

  return notification
}
