import { useMemo, useState } from 'react'
import Layout from '../components/Layout'
import MonthCalendar from '../components/MonthCalendar'
import EventCard from '../components/EventCard'
import { LoadingState, EmptyState, ErrorState, PageHeading } from '../components/ui'
import { useQuery } from '../hooks/useQuery'
import { eventsApi } from '../services/api'
import { formatDate, getMonthGrid, parseISODate, todayISO, toISODate } from '../lib/format'

export default function Calendar() {
  const today = todayISO()
  const initial = parseISODate(today) || new Date()
  const [viewYear, setViewYear] = useState(initial.getFullYear())
  const [viewMonth, setViewMonth] = useState(initial.getMonth())
  const [selectedDate, setSelectedDate] = useState(today)
  const [viewMode, setViewMode] = useState('calendar')

  const monthRange = useMemo(() => {
    const cells = getMonthGrid(viewYear, viewMonth)
    return { start: cells[0].iso, end: cells[cells.length - 1].iso }
  }, [viewYear, viewMonth])

  const { data, loading, error, refetch } = useQuery(
    () => eventsApi.listInRange(monthRange.start, monthRange.end),
    [monthRange.start, monthRange.end]
  )

  const upcoming = useQuery(() => eventsApi.listUpcoming(), [])

  const refreshAll = () => {
    refetch()
    upcoming.refetch()
  }

  const eventsByDate = useMemo(() => {
    const map = new Map()
    data?.forEach((event) => {
      const list = map.get(event.event_date) || []
      list.push(event)
      map.set(event.event_date, list)
    })
    return map
  }, [data])

  const eventDates = useMemo(() => new Set(eventsByDate.keys()), [eventsByDate])
  const selectedEvents = eventsByDate.get(selectedDate) || []

  const shiftMonth = (delta) => {
    const next = new Date(viewYear, viewMonth + delta, 1)
    setViewYear(next.getFullYear())
    setViewMonth(next.getMonth())
    setSelectedDate(toISODate(next))
  }

  const goToToday = () => {
    const now = parseISODate(today) || new Date()
    setViewYear(now.getFullYear())
    setViewMonth(now.getMonth())
    setSelectedDate(today)
  }

  const handleSelectDate = (iso) => {
    setSelectedDate(iso)
    const date = parseISODate(iso)
    if (!date) return
    setViewYear(date.getFullYear())
    setViewMonth(date.getMonth())
  }

  return (
    <Layout title="Calendar">
      <PageHeading title="Ward Calendar" subtitle="Browse events by month" />

      <div className="no-print mb-4 flex gap-1 rounded-xl bg-white p-1 shadow-soft">
        {[
          { id: 'calendar', label: 'Calendar' },
          { id: 'list', label: 'List' }
        ].map((mode) => (
          <button
            key={mode.id}
            type="button"
            onClick={() => setViewMode(mode.id)}
            className={`flex-1 rounded-lg px-3 py-2 text-sm font-semibold transition ${
              viewMode === mode.id ? 'bg-navy text-white' : 'text-ink/55'
            }`}
          >
            {mode.label}
          </button>
        ))}
      </div>

      {viewMode === 'calendar' && (
        <>
          <MonthCalendar
            year={viewYear}
            month={viewMonth}
            selectedDate={selectedDate}
            eventDates={eventDates}
            onSelectDate={handleSelectDate}
            onPrevMonth={() => shiftMonth(-1)}
            onNextMonth={() => shiftMonth(1)}
            onToday={goToToday}
          />

          <div className="mt-5">
            <h2 className="mb-3 text-lg text-navy">
              {formatDate(selectedDate, { weekday: 'long' })}
            </h2>

            {loading && <LoadingState label="Loading events…" />}
            {error && <ErrorState error={error} onRetry={refetch} />}
            {!loading && !error && selectedEvents.length === 0 && (
              <EmptyState
                icon="📅"
                title="No events this day"
                message="Select another date or check upcoming events in list view."
              />
            )}

            <div className="space-y-3">
              {selectedEvents.map((event) => (
                <EventCard key={event.id} event={event} onRsvpSuccess={refreshAll} />
              ))}
            </div>
          </div>
        </>
      )}

      {viewMode === 'list' && (
        <>
          {upcoming.loading && <LoadingState label="Loading events…" />}
          {upcoming.error && <ErrorState error={upcoming.error} onRetry={upcoming.refetch} />}
          {!upcoming.loading && !upcoming.error && upcoming.data?.length === 0 && (
            <EmptyState icon="📅" title="No upcoming events" message="Check back soon for new activities." />
          )}

          <div className="space-y-3">
            {upcoming.data?.map((event) => (
              <EventCard key={event.id} event={event} onRsvpSuccess={refreshAll} />
            ))}
          </div>
        </>
      )}
    </Layout>
  )
}