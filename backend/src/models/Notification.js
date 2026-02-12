import mongoose from 'mongoose'

const notificationSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    type: {
      type: String,
      enum: ['friend_request', 'like', 'comment', 'message'],
      required: true
    },
    fromUser: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    referenceId: { type: mongoose.Schema.Types.ObjectId },
    isRead: { type: Boolean, default: false }
  },
  { timestamps: true }
)

notificationSchema.index({ user: 1, isRead: 1, createdAt: -1 })

export default mongoose.model('Notification', notificationSchema)
