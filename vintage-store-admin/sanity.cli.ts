import {defineCliConfig} from 'sanity/cli'

export default defineCliConfig({
  api: {
    projectId: 'j7s2sxwm',
    dataset: 'production'
  },
  deployment: {
    appId: 'g4svogkmrftlyhqwbixrh86h',
    autoUpdates: true,
  }
})