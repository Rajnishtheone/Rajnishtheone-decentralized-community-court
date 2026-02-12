import Notification from '../models/Notification.js'

export const getNotifications = async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query
    const notifications = await Notification.find({ user: req.user.id })
      .populate('fromUser', 'name username profilePic')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit))

    res.json({
      notifications,
      page: Number(page),
      limit: Number(limit),
      hasMore: notifications.length === Number(limit)
    })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

export const markNotificationRead = async (req, res) => {
  try {
    const notification = await Notification.findOneAndUpdate(
      { _id: req.params.notificationId, user: req.user.id },
      { isRead: true },
      { new: true }
    )

    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' })
    }

    res.json({ notification })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

export const markAllRead = async (req, res) => {
  try {
    await Notification.updateMany({ user: req.user.id, isRead: false }, { isRead: true })
    res.json({ message: 'Notifications marked as read' })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}
