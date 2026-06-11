import { supabase } from '../lib/supabase'
import { todayISO } from '../lib/format'

// ---------- Programs ----------
export const programsApi = {
  // Public: most recent published program.
  getLatestPublished() {
    return supabase
      .from('programs')
      .select('*')
      .eq('status', 'published')
      .order('meeting_date', { ascending: false })
      .limit(1)
      .maybeSingle()
  },
  getPublishedForDate(meetingDate) {
    return supabase
      .from('programs')
      .select('*')
      .eq('status', 'published')
      .eq('meeting_date', meetingDate)
      .maybeSingle()
  },
  // Admin: all programs (drafts + published).
  listAll() {
    return supabase.from('programs').select('*').order('meeting_date', { ascending: false })
  },
  getById(id) {
    return supabase.from('programs').select('*').eq('id', id).single()
  },
  create(payload) {
    return supabase.from('programs').insert(payload).select().single()
  },
  update(id, payload) {
    return supabase
      .from('programs')
      .update({ ...payload, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single()
  },
  remove(id) {
    return supabase.from('programs').delete().eq('id', id)
  }
}

// ---------- Announcements ----------
export const announcementsApi = {
  listActive() {
    const today = todayISO()
    return supabase
      .from('announcements')
      .select('*')
      .lte('publish_date', today)
      .or(`expiration_date.is.null,expiration_date.gte.${today}`)
      .order('publish_date', { ascending: false })
  },
  listAll() {
    return supabase.from('announcements').select('*').order('publish_date', { ascending: false })
  },
  create(payload) {
    return supabase.from('announcements').insert(payload).select().single()
  },
  update(id, payload) {
    return supabase
      .from('announcements')
      .update({ ...payload, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single()
  },
  remove(id) {
    return supabase.from('announcements').delete().eq('id', id)
  }
}

// ---------- Calendar Events ----------
export const eventsApi = {
  listUpcoming() {
    return supabase
      .from('calendar_events')
      .select('*')
      .gte('event_date', todayISO())
      .order('event_date', { ascending: true })
  },
  listInRange(startDate, endDate) {
    return supabase
      .from('calendar_events')
      .select('*')
      .gte('event_date', startDate)
      .lte('event_date', endDate)
      .order('event_date', { ascending: true })
  },
  listAll() {
    return supabase.from('calendar_events').select('*').order('event_date', { ascending: true })
  },
  create(payload) {
    return supabase.from('calendar_events').insert(payload).select().single()
  },
  update(id, payload) {
    return supabase
      .from('calendar_events')
      .update({ ...payload, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single()
  },
  remove(id) {
    return supabase.from('calendar_events').delete().eq('id', id)
  },
  rsvpsFor(eventId) {
    return supabase
      .from('event_rsvps')
      .select('*')
      .eq('event_id', eventId)
      .order('created_at', { ascending: true })
  },
  rsvp(payload) {
    return supabase.from('event_rsvps').insert(payload)
  },
  removeRsvp(id) {
    return supabase.from('event_rsvps').delete().eq('id', id)
  }
}

// ---------- Volunteer Opportunities + Signups ----------
export const volunteerApi = {
  listOpen() {
    return supabase
      .from('volunteer_opportunities')
      .select('*')
      .gte('event_date', todayISO())
      .order('event_date', { ascending: true })
  },
  listAll() {
    return supabase
      .from('volunteer_opportunities')
      .select('*')
      .order('event_date', { ascending: true })
  },
  signupsFor(opportunityId) {
    return supabase
      .from('volunteer_signups')
      .select('*')
      .eq('opportunity_id', opportunityId)
      .order('created_at', { ascending: true })
  },
  createOpportunity(payload) {
    return supabase.from('volunteer_opportunities').insert(payload).select().single()
  },
  updateOpportunity(id, payload) {
    return supabase
      .from('volunteer_opportunities')
      .update({ ...payload, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single()
  },
  removeOpportunity(id) {
    return supabase.from('volunteer_opportunities').delete().eq('id', id)
  },
  signup(payload) {
    return supabase.from('volunteer_signups').insert(payload)
  },
  removeSignup(id) {
    return supabase.from('volunteer_signups').delete().eq('id', id)
  }
}

// ---------- Volunteer Opportunity Submissions ----------
export const volunteerSubmissionsApi = {
  submit(payload) {
    return supabase.from('volunteer_opportunity_submissions').insert({
      ...payload,
      status: 'pending'
    })
  },
  listAll() {
    return supabase
      .from('volunteer_opportunity_submissions')
      .select('*')
      .order('created_at', { ascending: false })
  },
  listPending() {
    return supabase
      .from('volunteer_opportunity_submissions')
      .select('*')
      .eq('status', 'pending')
      .order('created_at', { ascending: false })
  },
  async approve(id, opportunityPayload) {
    const { data: opportunity, error: opportunityError } = await supabase
      .from('volunteer_opportunities')
      .insert(opportunityPayload)
      .select()
      .single()
    if (opportunityError) return { data: null, error: opportunityError }

    return supabase
      .from('volunteer_opportunity_submissions')
      .update({
        status: 'approved',
        reviewed_at: new Date().toISOString(),
        opportunity_id: opportunity.id,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single()
  },
  reject(id) {
    return supabase
      .from('volunteer_opportunity_submissions')
      .update({
        status: 'rejected',
        reviewed_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single()
  },
  remove(id) {
    return supabase.from('volunteer_opportunity_submissions').delete().eq('id', id)
  }
}

// ---------- Missionary Meals ----------
export const mealsApi = {
  listOpen() {
    return supabase
      .from('missionary_meals')
      .select('*')
      .eq('status', 'open')
      .gte('meal_date', todayISO())
      .order('meal_date', { ascending: true })
  },
  listAll() {
    return supabase
      .from('missionary_meals')
      .select('*, missionary_meal_signups(*)')
      .order('meal_date', { ascending: true })
  },
  createSlot(payload) {
    return supabase.from('missionary_meals').insert(payload).select().single()
  },
  updateSlot(id, payload) {
    return supabase
      .from('missionary_meals')
      .update({ ...payload, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single()
  },
  removeSlot(id) {
    return supabase.from('missionary_meals').delete().eq('id', id)
  },
  signup(payload) {
    return supabase.from('missionary_meal_signups').insert(payload)
  },
  removeSignup(id) {
    return supabase.from('missionary_meal_signups').delete().eq('id', id)
  }
}

// ---------- Building Cleaning ----------
export const cleaningApi = {
  listOpen() {
    return supabase
      .from('building_cleaning_slots')
      .select('*')
      .gte('cleaning_date', todayISO())
      .order('cleaning_date', { ascending: true })
  },
  listAll() {
    return supabase
      .from('building_cleaning_slots')
      .select('*')
      .order('cleaning_date', { ascending: true })
  },
  signupsFor(slotId) {
    return supabase
      .from('building_cleaning_signups')
      .select('*')
      .eq('slot_id', slotId)
      .order('created_at', { ascending: true })
  },
  createSlot(payload) {
    return supabase.from('building_cleaning_slots').insert(payload).select().single()
  },
  updateSlot(id, payload) {
    return supabase
      .from('building_cleaning_slots')
      .update({ ...payload, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single()
  },
  removeSlot(id) {
    return supabase.from('building_cleaning_slots').delete().eq('id', id)
  },
  signup(payload) {
    return supabase.from('building_cleaning_signups').insert(payload)
  },
  removeSignup(id) {
    return supabase.from('building_cleaning_signups').delete().eq('id', id)
  }
}

// ---------- Lesson Schedules ----------
export const lessonsApi = {
  listUpcoming() {
    return supabase
      .from('lesson_schedules')
      .select('*')
      .gte('lesson_date', todayISO())
      .order('lesson_date', { ascending: true })
  },
  listAll() {
    return supabase.from('lesson_schedules').select('*').order('lesson_date', { ascending: false })
  },
  create(payload) {
    return supabase.from('lesson_schedules').insert(payload).select().single()
  },
  update(id, payload) {
    return supabase
      .from('lesson_schedules')
      .update({ ...payload, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single()
  },
  remove(id) {
    return supabase.from('lesson_schedules').delete().eq('id', id)
  }
}

// ---------- Good News Submissions ----------
export const goodNewsApi = {
  async uploadImage(file) {
    const extension = file.name.split('.').pop()?.toLowerCase() || 'jpg'
    const path = `${crypto.randomUUID()}/${Date.now()}.${extension}`
    const { data, error } = await supabase.storage
      .from('good-news-images')
      .upload(path, file, { cacheControl: '3600', upsert: false })
    if (error) return { data: null, error }

    const { data: publicData } = supabase.storage.from('good-news-images').getPublicUrl(data.path)
    return { data: { path: data.path, url: publicData.publicUrl }, error: null }
  },
  async removeImage(imageUrl) {
    const marker = '/good-news-images/'
    const index = imageUrl?.indexOf(marker)
    if (index === -1) return { error: null }
    const path = imageUrl.slice(index + marker.length)
    return supabase.storage.from('good-news-images').remove([path])
  },
  // Public INSERT only.
  submit(payload) {
    return supabase.from('good_news_submissions').insert({
      ...payload,
      status: 'pending'
    })
  },
  listAll() {
    return supabase
      .from('good_news_submissions')
      .select('*')
      .order('created_at', { ascending: false })
  },
  listPending() {
    return supabase
      .from('good_news_submissions')
      .select('*')
      .eq('status', 'pending')
      .order('created_at', { ascending: false })
  },
  async approve(id, announcementPayload) {
    const { data: announcement, error: announcementError } = await supabase
      .from('announcements')
      .insert(announcementPayload)
      .select()
      .single()
    if (announcementError) return { data: null, error: announcementError }

    return supabase
      .from('good_news_submissions')
      .update({
        status: 'approved',
        reviewed_at: new Date().toISOString(),
        announcement_id: announcement.id,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single()
  },
  reject(id) {
    return supabase
      .from('good_news_submissions')
      .update({
        status: 'rejected',
        reviewed_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single()
  },
  async remove(id, imageUrl) {
    if (imageUrl) await goodNewsApi.removeImage(imageUrl)
    return supabase.from('good_news_submissions').delete().eq('id', id)
  }
}

// ---------- Help Requests (private) ----------
export const helpApi = {
  // Public INSERT only.
  submit(payload) {
    return supabase.from('help_requests').insert(payload)
  },
  // Admin-only SELECT (enforced by RLS).
  listAll() {
    return supabase.from('help_requests').select('*').order('created_at', { ascending: false })
  },
  markHandled(id, handled) {
    return supabase
      .from('help_requests')
      .update({ handled, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single()
  },
  remove(id) {
    return supabase.from('help_requests').delete().eq('id', id)
  }
}
