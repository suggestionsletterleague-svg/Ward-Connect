// Central place for ward-wide configuration and shared option lists.
// Change WARD_NAME to your ward's name.
export const WARD_NAME = 'Greenfield 1st Ward'
export const WARD_TAGLINE = 'Connecting, serving, and worshipping together'

export const ANNOUNCEMENT_CATEGORIES = [
  'Ward',
  'Good News',
  'Youth',
  'Relief Society',
  'Elders Quorum',
  'Primary',
  'Activities',
  'Service'
]

export const EVENT_CATEGORIES = [
  'Ward Activity',
  'Youth',
  'Primary',
  'Relief Society',
  'Elders Quorum',
  'Temple Trip',
  'Service Project',
  'Other'
]

export const HELP_REQUEST_TYPES = [
  'Meal Assistance',
  'Moving Assistance',
  'Transportation',
  'Visit Request',
  'Prayer Request',
  'Other'
]

// Tailwind chip classes per category (kept readable + high contrast).
export const CATEGORY_STYLES = {
  Ward: 'bg-navy/10 text-navy',
  'Good News': 'bg-gold-mist text-gold-dark',
  Youth: 'bg-gold-mist text-gold-dark',
  'Relief Society': 'bg-sage-mist text-sage-dark',
  'Elders Quorum': 'bg-navy/10 text-navy-light',
  Primary: 'bg-gold-mist text-gold-dark',
  Activities: 'bg-sage-mist text-sage-dark',
  Service: 'bg-sage/15 text-sage-dark',
  'Ward Activity': 'bg-navy/10 text-navy',
  'Temple Trip': 'bg-gold-mist text-gold-dark',
  'Service Project': 'bg-sage/15 text-sage-dark',
  Other: 'bg-gray-100 text-gray-600'
}

export function categoryClass(category) {
  return CATEGORY_STYLES[category] || 'bg-gray-100 text-gray-600'
}
