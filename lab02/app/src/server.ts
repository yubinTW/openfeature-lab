import fastify from 'fastify'
import { OpenFeature } from '@openfeature/server-sdk'
import { FlagdProvider } from '@openfeature/flagd-provider'
import promClient from 'prom-client'

declare module 'fastify' {
  interface FastifyRequest {
    startTime: [number, number]
    flag: 'Normal' | 'Experiment'
  }
}

type AppConfig = {
  port: number
  host: string
  flagdHost: string
  flagdPort: number
}

const httpRequestDurationMicroseconds = new promClient.Histogram({
  name: 'http_request_duration_ms',
  help: 'Duration of HTTP requests in ms',
  labelNames: ['method', 'route', 'code', 'flag']
})

promClient.collectDefaultMetrics()

export const startServer = async (appConfig: AppConfig) => {
  // Create an instance of Fastify
  const server = fastify()

  server.addHook('onRequest', async (request, reply) => {
    request.startTime = process.hrtime()
  })

  server.addHook('onResponse', async (request, reply) => {
    const duration = process.hrtime(request.startTime)
    const durationInMs = duration[0] * 1000 + duration[1] / 1e6
    httpRequestDurationMicroseconds
      .labels(request.routeOptions.method, request.routeOptions.config.url, `${reply.statusCode}`, request.flag)
      .observe(durationInMs)
  })

  // Initialize OpenFeature
  OpenFeature.setProvider(
    new FlagdProvider({
      host: appConfig.flagdHost,
      port: appConfig.flagdPort
    })
  )
  const client = OpenFeature.getClient()

  server.get('/', async (request, reply) => {
    return { hello: 'world' }
  })

  server.get('/ping', async (request, reply) => {
    const email = request.headers['email'] as string
    const context = { email }
    const enableExperimentFeature = await client.getBooleanValue('experiment', true, context)
    request.flag = enableExperimentFeature ? 'Experiment' : 'Normal'

    if (enableExperimentFeature) {
      await new Promise((resolve) => setTimeout(resolve, Math.floor(Math.random() * 500))) // experiment workflow is slow! QAQ
      return { message: 'Experiment: pong!pong!pong!' }
    } else {
      return { message: 'pong!' }
    }
  })

  server.get('/metrics', async (request, reply) => {
    reply.header('Content-Type', promClient.register.contentType)
    reply.send(await promClient.register.metrics())
  })

  // Run the server!
  await server.listen({ port: appConfig.port, host: appConfig.host })
}
