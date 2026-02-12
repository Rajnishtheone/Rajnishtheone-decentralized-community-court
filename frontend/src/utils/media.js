const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api'
const serverBaseUrl = apiBaseUrl.replace(/\/api\/?$/, '')

export const getProfilePicUrl = (profilePic) => {
  if (!profilePic) return '/default-avatar.svg'
  if (profilePic.startsWith('http')) return profilePic
  if (profilePic.startsWith('/uploads/')) return `${serverBaseUrl}${profilePic}`
  return `${serverBaseUrl}/uploads/${profilePic}`
}

export const getMediaUrl = (mediaUrl) => {
  if (!mediaUrl) return ''
  if (mediaUrl.startsWith('http')) return mediaUrl
  if (mediaUrl.startsWith('/uploads/')) return `${serverBaseUrl}${mediaUrl}`
  return `${serverBaseUrl}/uploads/${mediaUrl}`
}
