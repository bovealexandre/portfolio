import { component$, $, useOnWindow, useStyles$ } from '@builder.io/qwik'
import {
  QwikCity,
  RouterOutlet,
  ServiceWorkerRegister,
} from '@builder.io/qwik-city'
import { RouterHead } from './components/router-head/router-head'

import styles from './global.scss?inline'

import * as THREE from 'three'

export default component$(() => {
  useStyles$(styles)
  /**
   * The root of a QwikCity site always start with the <QwikCity> component,
   * immediately followed by the document's <head> and <body>.
   *
   * Dont remove the `<head>` and `<body>` elements.
   */
  useOnWindow(
    'mount',
    $((event) => {
      console.log(event)
    })
  )

  //   useMount$(() => {
  //     const scene = new THREE.Scene()

  //     const camera = new THREE.PerspectiveCamera(
  //       75,
  //       window.innerWidth / window.innerHeight,
  //       0.1,
  //       1000
  //     )

  //     const renderer = new THREE.WebGLRenderer()
  //     renderer.setSize(window.innerWidth, window.innerHeight)
  //     document.body.appendChild(renderer.domElement)

  //     const geometry = new THREE.BoxGeometry(1, 1, 1)
  //     const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 })
  //     const cube = new THREE.Mesh(geometry, material)
  //     scene.add(cube)

  //     camera.position.z = 5

  //     function animate() {
  //       requestAnimationFrame(animate)
  //       renderer.render(scene, camera)
  //     }
  //     animate()
  //   })

  return (
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
  )
})
