export default function AnnouncementImage({ src, alt, className = '' }) {
  if (!src) return null

  return (
    <img
      src={src}
      alt={alt || ''}
      className={`w-full rounded-xl object-cover ${className}`}
      loading="lazy"
    />
  )
}