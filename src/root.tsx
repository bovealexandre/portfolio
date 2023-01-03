import { component$, $, useOnWindow, useStyles$ } from '@builder.io/qwik'
import {
  QwikCity,
  RouterOutlet,
  ServiceWorkerRegister,
} from '@builder.io/qwik-city'
import { RouterHead } from './components/router-head/router-head'

import styles from './global.scss?inline'

import { QwikSpeak } from 'qwik-speak'
import { config, translationFn } from './speak-config'

export default component$(() => {
  useStyles$(styles)
  /**
   * The root of a QwikCity site always start with the <QwikCity> component,
   * immediately followed by the document's <head> and <body>.
   *
   * Dont remove the `<head>` and `<body>` elements.
   */

  return (
    <QwikSpeak config={config} translationFn={translationFn}>
      <QwikCity>
        <head>
          <meta charSet="utf-8" />
          <RouterHead />
        </head>
        <body lang="en">
          <RouterOutlet />
          <ServiceWorkerRegister />
        </body>
      </QwikCity>
    </QwikSpeak>
  )
})
