import { defineConfig } from 'vite'
import { qwikVite } from '@builder.io/qwik/optimizer'
import { qwikCity } from '@builder.io/qwik-city/vite'
import tsconfigPaths from 'vite-tsconfig-paths'
import { qwikSpeakInline } from 'qwik-speak/inline';
import netlifyEdge from '@netlify/vite-plugin-netlify-edge'

export default defineConfig(() => {
  return {
    plugins: [
      qwikCity({ trailingSlash: false }),
      qwikVite(),
      tsconfigPaths(),
      // qwikSpeakInline({
      //   supportedLangs: ['en-EN', 'it-IT', 'fr-FR', 'nl-NL', 'sp-SP'],
      //   defaultLang: 'fr-FR'
      // }),
    ],
  }
})
