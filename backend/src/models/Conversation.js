import mongoose from 'mongoose'

const conversationSchema = new mongoose.Schema(
  {
    participants: {
      type: [mongoose.Schema.Types.ObjectId],
      ref: 'User',
      validate: [arr => arr.length === 2, 'Conversation must have 2 participants'],
      required: true
    },
    lastMessage: { type: String, default: '' },
    lastMessageAt: { type: Date }
  },
  { timestamps: true }
)

conversationSchema.index({ participants: 1 })

export default mongoose.model('Conversation', conversationSchema)
