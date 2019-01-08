// @flow
import errors from 'restify-errors'

function responseGuard(req: any, res: any, next: any) {
  if (process.env.DATABASE_UNHEALTHY === 'true') {
    const error = new errors.InternalError(
      'The database is not synchronised with the blockchain.')
    return next(error)
  }
  return next()
}

export default responseGuard
