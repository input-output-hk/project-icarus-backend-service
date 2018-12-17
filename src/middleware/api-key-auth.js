// @flow
import errors from 'restify-errors'

const SUPPORTED_SCHEME = 'Bearer'

function createAnonymousUserApiKey(req) {
  const remoteAddress = req.headers['x-forwarded-for']
  return remoteAddress ? `anonymous-${remoteAddress}` : null
}

function apiKeyAuth(req, res, next) {
  const anonymousUserApiKey = createAnonymousUserApiKey(req)
  if (anonymousUserApiKey) {
    req.username = anonymousUserApiKey
  }

  if (!req.headers.authorization) {
    return next()
  }

  const parts = req.headers.authorization.split(' ', 2)
  if (!parts || parts.length !== 2) {
    const error = new errors.InvalidHeaderError(
      'Authorization header content is invalid.',
    )
    return next(error)
  }

  const scheme = parts[0]
  const apiKey = parts[1]

  if (scheme !== SUPPORTED_SCHEME) {
    return next()
  }

  req.authorization = { scheme, credentials: apiKey }
  req.username = apiKey

  return next()
}

export default apiKeyAuth