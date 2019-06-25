// @flow
import errors from 'restify-errors'

function shouldBlockRequest(req: any): boolean {
  if (req.url === '/api/v2/healthcheck') {
    return !!global.instanceUnhealthyFrom
  } else if (req.url === '/api/v2/bestBlock' || req.url === '/api/txs/last') {
    // these requests are good to inspect the instance when it becomes unhealthy
    return false
  }

  // we give a grace period of 50s to the remaining requests so load balancer has time
  // to disable the instance without downtime
  const currentTime = Math.floor((new Date().getTime()) / 1000)
  return !!global.instanceUnhealthyFrom && (currentTime - global.instanceUnhealthyFrom >= 50)
}

function responseGuard(req: any, res: any, next: any) {
  if (shouldBlockRequest(req)) {
    return next(new errors.InternalError(
      'The instance is unhealthy',
    ))
  }

  return next()
}

export default responseGuard
