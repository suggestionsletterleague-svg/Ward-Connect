import EntityManager from '../../components/admin/EntityManager'
import { TextField, TextArea, SelectField } from '../../components/admin/Fields'
import { CategoryChip } from '../../components/ui'
import { eventsApi } from '../../services/api'
import { EVENT_CATEGORIES } from '../../lib/constants'
import { formatDate, formatTime, todayISO } from '../../lib/format'

const empty = {
  title: '',
  description: '',
  event_date: todayISO(),
  event_time: '',
  location: '',
  category: EVENT_CATEGORIES[0]
}

export default function AdminEvents() {
  return (
    <EntityManager
      title="Calendar Events"
      addLabel="New Event"
      api={eventsApi}
      emptyFields={empty}
      emptyIcon="📅"
      toPayload={(v) => ({
        title: v.title,
        description: v.description || null,
        event_date: v.event_date,
        event_time: v.event_time || null,
        location: v.location || null,
        category: v.category
      })}
      renderItem={(ev) => (
        <>
          <div className="mb-1 flex items-center gap-2">
            <CategoryChip category={ev.category} />
            <span className="text-xs text-ink/45">
              {formatDate(ev.event_date, { weekday: 'short' })}
              {ev.event_time && ` · ${formatTime(ev.event_time)}`}
            </span>
          </div>
          <h2 className="text-lg leading-tight">{ev.title}</h2>
          {ev.location && <p className="mt-0.5 text-sm text-sage-dark">{ev.location}</p>}
        </>
      )}
      renderForm={({ values, setField }) => (
        <>
          <TextField label="Title" required value={values.title} onChange={(v) => setField('title', v)} />
          <TextArea label="Description" value={values.description} onChange={(v) => setField('description', v)} />
          <div className="grid grid-cols-2 gap-3">
            <TextField label="Date" type="date" required value={values.event_date} onChange={(v) => setField('event_date', v)} />
            <TextField label="Time" type="time" value={values.event_time} onChange={(v) => setField('event_time', v)} />
          </div>
          <TextField label="Location" value={values.location} onChange={(v) => setField('location', v)} />
          <SelectField label="Category" value={values.category} onChange={(v) => setField('category', v)} options={EVENT_CATEGORIES} />
        </>
      )}
    />
  )
}
