export const MAX_IMAGE_BYTES = 5 * 1024 * 1024 // 5 MB

export const ACCEPTED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']

export function validateImageFile(file) {
  if (!file) return null
  if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
    return 'Please choose a JPG, PNG, WebP, or GIF image.'
  }
  if (file.size > MAX_IMAGE_BYTES) {
    return 'Photos must be 5 MB or smaller.'
  }
  return null
}

export function storagePathFromImageUrl(imageUrl) {
  if (!imageUrl) return null
  const marker = '/good-news-images/'
  const index = imageUrl.indexOf(marker)
  if (index === -1) return null
  return imageUrl.slice(index + marker.length)
}