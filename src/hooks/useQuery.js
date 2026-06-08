import { useEffect, useState, useCallback } from 'react'

// Generic async data hook. Pass a function returning a Supabase query promise.
// Re-runs when `deps` change or when `refetch()` is called.
export function useQuery(queryFn, deps = []) {
  const [data, setData] = useState(null)
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(true)
  const [nonce, setNonce] = useState(0)

  const refetch = useCallback(() => setNonce((n) => n + 1), [])

  useEffect(() => {
    let active = true
    setLoading(true)
    Promise.resolve(queryFn())
      .then(({ data, error }) => {
        if (!active) return
        if (error) setError(error)
        else setData(data)
      })
      .catch((err) => active && setError(err))
      .finally(() => active && setLoading(false))
    return () => {
      active = false
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps, nonce])

  return { data, error, loading, refetch }
}
