import multer from 'multer'
import path from 'path'
import { fileURLToPath } from 'url'
import fs from 'fs'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const uploadsDir = path.join(__dirname, '../../uploads')
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true })
}

const localStorage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadsDir),
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9)
    cb(null, `post-${uniqueSuffix}${path.extname(file.originalname)}`)
  }
})

const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/') || file.mimetype.startsWith('video/')) {
    cb(null, true)
  } else {
    cb(new Error('Only image and video files are allowed!'), false)
  }
}

const upload = multer({
  storage: localStorage,
  fileFilter,
  limits: {
    fileSize: 20 * 1024 * 1024
  }
})

const handleUploadError = (error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        message: 'File too large. Maximum file size is 20MB.',
        error: 'FILE_TOO_LARGE'
      })
    }
    if (error.code === 'LIMIT_UNEXPECTED_FILE') {
      return res.status(400).json({
        success: false,
        message: 'Unexpected file field.',
        error: 'UNEXPECTED_FILE'
      })
    }
  }

  if (error.message === 'Only image and video files are allowed!') {
    return res.status(400).json({
      success: false,
      message: 'Only image and video files are allowed.',
      error: 'INVALID_FILE_TYPE'
    })
  }

  next(error)
}

export { upload, handleUploadError }
export default upload
