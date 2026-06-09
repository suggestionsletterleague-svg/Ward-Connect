import { getMonthGrid } from '../lib/format'

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

export default function MonthCalendar({
  year,
  month,
  selectedDate,
  eventDates = new Set(),
  onSelectDate,
  onPrevMonth,
  onNextMonth,
  onToday
}) {
  const cells = getMonthGrid(year, month)

  return (
    <div className="card rise-in">
      <div className="mb-4 flex items-center justify-between gap-2">
        <button
          type="button"
          onClick={onPrevMonth}
          aria-label="Previous month"
          className="rounded-xl p-2 text-navy hover:bg-sage-mist"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M15 18l-6-6 6-6" />
          </svg>
        </button>

        <div className="text-center">
          <h2 className="text-lg leading-tight">
            {new Date(year, month, 1).toLocaleDateString(undefined, {
              month: 'long',
              year: 'numeric'
            })}
          </h2>
        </div>

        <button
          type="button"
          onClick={onNextMonth}
          aria-label="Next month"
          className="rounded-xl p-2 text-navy hover:bg-sage-mist"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 18l6-6-6-6" />
          </svg>
        </button>
      </div>

      <button type="button" onClick={onToday} className="btn-ghost mb-4 w-full py-2 text-sm">
        Jump to today
      </button>

      <div className="grid grid-cols-7 gap-1 text-center text-xs font-semibold uppercase tracking-wide text-ink/45">
        {WEEKDAYS.map((day) => (
          <div key={day} className="py-1">
            {day}
          </div>
        ))}
      </div>

      <div className="mt-1 grid grid-cols-7 gap-1">
        {cells.map((cell) => {
          const hasEvents = eventDates.has(cell.iso)
          const isSelected = selectedDate === cell.iso

          return (
            <button
              key={cell.iso}
              type="button"
              onClick={() => onSelectDate(cell.iso)}
              aria-label={`${cell.day}${hasEvents ? ', has events' : ''}${cell.isToday ? ', today' : ''}`}
              aria-pressed={isSelected}
              className={`relative flex aspect-square flex-col items-center justify-center rounded-xl text-sm font-semibold transition ${
                isSelected
                  ? 'bg-navy text-white shadow-soft'
                  : cell.isToday
                    ? 'bg-gold-mist text-navy ring-2 ring-gold/50'
                    : cell.inMonth
                      ? 'text-navy hover:bg-sage-mist'
                      : 'text-ink/25 hover:bg-cream'
              }`}
            >
              <span>{cell.day}</span>
              {hasEvents && (
                <span
                  className={`mt-0.5 h-1.5 w-1.5 rounded-full ${
                    isSelected ? 'bg-gold-light' : 'bg-gold'
                  }`}
                  aria-hidden="true"
                />
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}