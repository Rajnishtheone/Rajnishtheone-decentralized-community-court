import mongoose from 'mongoose'

const socialCommentSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    postId: { type: mongoose.Schema.Types.ObjectId, ref: 'Post', required: true },
    text: { type: String, trim: true, maxlength: 1000, required: true }
  },
  { timestamps: true }
)

socialCommentSchema.index({ postId: 1, createdAt: -1 })

export default mongoose.model('SocialComment', socialCommentSchema)
