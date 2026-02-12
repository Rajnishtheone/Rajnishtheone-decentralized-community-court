import mongoose from 'mongoose'

const postSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    caption: { type: String, trim: true, maxlength: 2000 },
    mediaUrl: { type: String, default: '' },
    mediaType: { type: String, enum: ['image', 'video', 'none'], default: 'none' },
    visibility: { type: String, enum: ['friends', 'public'], default: 'friends' },
    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    dislikes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    comments: [{ type: mongoose.Schema.Types.ObjectId, ref: 'SocialComment' }]
  },
  { timestamps: true }
)

postSchema.index({ user: 1, createdAt: -1 })
postSchema.index({ visibility: 1, createdAt: -1 })

export default mongoose.model('Post', postSchema)
