import EntityManager from '../../components/admin/EntityManager'
import { TextField, TextArea, SelectField } from '../../components/admin/Fields'
import { CategoryChip } from '../../components/ui'
import { announcementsApi } from '../../services/api'
import { ANNOUNCEMENT_CATEGORIES } from '../../lib/constants'
import { formatDate, todayISO } from '../../lib/format'

const empty = {
  title: '',
  body: '',
  category: ANNOUNCEMENT_CATEGORIES[0],
  publish_date: todayISO(),
  expiration_date: '',
  link_url: ''
}

export default function AdminAnnouncements() {
  return (
    <EntityManager
      title="Announcements"
      addLabel="New Announcement"
      api={announcementsApi}
      emptyFields={empty}
      emptyIcon="📣"
      toPayload={(v) => ({
        title: v.title,
        body: v.body || null,
        category: v.category,
        publish_date: v.publish_date,
        expiration_date: v.expiration_date || null,
        link_url: v.link_url || null
      })}
      renderItem={(a) => (
        <>
          <div className="mb-1 flex items-center gap-2">
            <CategoryChip category={a.category} />
            <span className="text-xs text-ink/45">{formatDate(a.publish_date, { weekday: 'short' })}</span>
          </div>
          <h2 className="text-lg leading-tight">{a.title}</h2>
          {a.body && <p className="mt-1 line-clamp-2 text-sm text-ink/60">{a.body}</p>}
        </>
      )}
      renderForm={({ values, setField }) => (
        <>
          <TextField label="Title" required value={values.title} onChange={(v) => setField('title', v)} />
          <TextArea label="Body" rows={4} value={values.body} onChange={(v) => setField('body', v)} />
          <SelectField label="Category" value={values.category} onChange={(v) => setField('category', v)} options={ANNOUNCEMENT_CATEGORIES} />
          <div className="grid grid-cols-2 gap-3">
            <TextField label="Publish Date" type="date" required value={values.publish_date} onChange={(v) => setField('publish_date', v)} />
            <TextField label="Expiration Date" type="date" value={values.expiration_date} onChange={(v) => setField('expiration_date', v)} />
          </div>
          <TextField label="Link (optional)" type="url" placeholder="https://…" value={values.link_url} onChange={(v) => setField('link_url', v)} />
        </>
      )}
    />
  )
}
