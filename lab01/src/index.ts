import { startServer } from './server'

const appConfig = {
  port: 8888,
  host: '0.0.0.0'
}

startServer(appConfig)
  .then(() => {
    console.log(`Server running at http://${appConfig.host}:${appConfig.port}/`)
  })
  .catch((err) => {
    console.error(`Failed to start server: ${err}`)
  })
