/**
 * WHAT IS THIS FILE?
 *
 * SSR entry point, in all cases the application is render outside the browser, this
 * entry point will be the common one.
 *
 * - Server (express, cloudflare...)
 * - npm run start
 * - npm run preview
 * - npm run build
 *
 */
import { renderToStream, RenderToStreamOptions } from '@builder.io/qwik/server'
import { manifest } from '@qwik-client-manifest'
import Root from './root'
import { config } from './speak-config'

export default function (opts: RenderToStreamOptions) {
  return renderToStream(<Root />, {
    manifest,
    ...opts,
    containerAttributes: {
      lang:
        opts.envData?.locale?.replace(/^\/|\/$/g, '') ||
        config.defaultLocale.lang,
      ...opts.containerAttributes,
    },
  })
}
