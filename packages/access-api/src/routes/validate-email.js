/* eslint-disable no-unused-vars */
import QRCode from 'qrcode'
import {
  HtmlResponse,
  ValidateEmail,
  ValidateEmailError,
} from '../utils/html.js'

/**
 * @param {import('@web3-storage/worker-utils/router').ParsedRequest} req
 * @param {import('../bindings.js').RouteContext} env
 */
export async function validateEmail(req, env) {
  if (req.query && req.query.ucan) {
    try {
      const delegation = await env.kvs.validations.put(req.query.ucan)

      return new HtmlResponse(
        (
          <ValidateEmail
            delegation={delegation}
            ucan={req.query.ucan}
            qrcode={await QRCode.toString(req.query.ucan, {
              type: 'svg',
              errorCorrectionLevel: 'M',
              margin: 10,
            })}
          />
        )
      )
    } catch (error) {
      const err = /** @type {Error} */ (error)

      if (err.message.includes('Invalid expiration')) {
        return new HtmlResponse(
          <ValidateEmailError msg={'Email confirmation expired.'} />
        )
      }

      env.log.error(err)
      return new HtmlResponse(
        <ValidateEmailError msg={'Oops something went wrong.'} />
      )
    }
  }

  return new HtmlResponse(
    <ValidateEmailError msg={'Missing delegation in the URL.'} />
  )
}