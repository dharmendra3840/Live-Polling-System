export function toHttpError(err: any) {
  const code = err?.code
  if (code === 'DB_UNAVAILABLE') return { status: 503, message: 'database unavailable' }
  if (code === 'VALIDATION') return { status: 400, message: err.message || 'invalid request' }
  if (code === 'POLL_NOT_FOUND') return { status: 404, message: 'poll not found' }
  if (code === 'OPTION_NOT_FOUND') return { status: 404, message: 'option not found' }
  if (code === 'POLL_ACTIVE') return { status: 409, message: 'another poll is already active' }
  if (code === 'POLL_INACTIVE') return { status: 409, message: 'poll not active' }
  if (code === 'POLL_ENDED') return { status: 410, message: 'poll ended' }
  if (code === 'ALREADY_VOTED') return { status: 409, message: 'already voted' }
  return { status: 500, message: err?.message || 'internal server error' }
}

export function toSocketError(err: any) {
  const code = err?.code
  if (code === 'DB_UNAVAILABLE') return { ok: false, error: 'database unavailable' }
  if (code === 'VALIDATION') return { ok: false, error: err.message || 'invalid request' }
  if (code === 'POLL_NOT_FOUND') return { ok: false, error: 'poll not found' }
  if (code === 'OPTION_NOT_FOUND') return { ok: false, error: 'option not found' }
  if (code === 'POLL_ACTIVE') return { ok: false, error: 'another poll is already active' }
  if (code === 'POLL_INACTIVE') return { ok: false, error: 'poll not active' }
  if (code === 'POLL_ENDED') return { ok: false, error: 'poll ended' }
  if (code === 'ALREADY_VOTED') return { ok: false, error: 'already voted' }
  return { ok: false, error: err?.message || 'error' }
}
