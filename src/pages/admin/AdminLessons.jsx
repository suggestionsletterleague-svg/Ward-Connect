import EntityManager from '../../components/admin/EntityManager'
import { TextField, TextArea } from '../../components/admin/Fields'
import { lessonsApi } from '../../services/api'
import { formatDate, todayISO } from '../../lib/format'

const empty = {
  lesson_date: todayISO(),
  sunday_school_topic: '',
  relief_society_lesson: '',
  elders_quorum_lesson: '',
  youth_lesson: '',
  primary_notes: '',
  link_url: ''
}

export default function AdminLessons() {
  return (
    <EntityManager
      title="Lesson Schedule"
      addLabel="New Lesson Schedule"
      api={lessonsApi}
      emptyFields={empty}
      emptyIcon="✝️"
      toPayload={(v) => ({
        lesson_date: v.lesson_date,
        sunday_school_topic: v.sunday_school_topic || null,
        relief_society_lesson: v.relief_society_lesson || null,
        elders_quorum_lesson: v.elders_quorum_lesson || null,
        youth_lesson: v.youth_lesson || null,
        primary_notes: v.primary_notes || null,
        link_url: v.link_url || null
      })}
      renderItem={(l) => (
        <>
          <h2 className="text-lg leading-tight">{formatDate(l.lesson_date, { weekday: 'long' })}</h2>
          <p className="mt-0.5 line-clamp-2 text-sm text-ink/55">
            {[l.sunday_school_topic, l.relief_society_lesson, l.elders_quorum_lesson].filter(Boolean).join(' · ') || 'No topics set'}
          </p>
        </>
      )}
      renderForm={({ values, setField }) => (
        <>
          <TextField label="Lesson Date (Sunday)" type="date" required value={values.lesson_date} onChange={(v) => setField('lesson_date', v)} />
          <TextField label="Sunday School Topic" value={values.sunday_school_topic} onChange={(v) => setField('sunday_school_topic', v)} />
          <TextField label="Relief Society Lesson" value={values.relief_society_lesson} onChange={(v) => setField('relief_society_lesson', v)} />
          <TextField label="Elders Quorum Lesson" value={values.elders_quorum_lesson} onChange={(v) => setField('elders_quorum_lesson', v)} />
          <TextField label="Youth Lesson" value={values.youth_lesson} onChange={(v) => setField('youth_lesson', v)} />
          <TextArea label="Primary Notes" value={values.primary_notes} onChange={(v) => setField('primary_notes', v)} />
          <TextField label="Resource Link (optional)" type="url" placeholder="https://…" value={values.link_url} onChange={(v) => setField('link_url', v)} />
        </>
      )}
    />
  )
}
