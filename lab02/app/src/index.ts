import { startServer } from './server'

const appConfig = {
  port: parseInt(process.env.FASTIFY_PORT || '8888'),
  host: process.env.FASTIFY_HOST || '0.0.0.0',
  flagdHost: process.env.FLAGD_HOST || 'localhost',
  flagdPort: parseInt(process.env.FLAGD_PORT || '8013')
}

startServer(appConfig)
  .then(() => {
    console.log(`Server running at http://${appConfig.host}:${appConfig.port}/`)
  })
  .catch((err) => {
    console.error(`Failed to start server: ${err}`)
  })
