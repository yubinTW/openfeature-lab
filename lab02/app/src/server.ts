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

  server.decorate('startTime')

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
      host: process.env.FLAGD_HOST,
      port: parseInt(process.env.FLAGD_PORT || '8013')
    })
  )
  const client = OpenFeature.getClient()

  // Declare a route
  server.get('/', async (request, reply) => {
    return { hello: 'world' }
  })

  server.get('/ping', async (request, reply) => {
    // Evaluate the feature flag 'experiment'
    const enableFeatureA = await client.getBooleanValue('experiment', false)
    request.flag = enableFeatureA ? 'Experiment' : 'Normal'

    if (enableFeatureA) {
      await new Promise((resolve) => setTimeout(resolve, 500)) // experiment workflow is slow! QAQ
      return { message: 'pong!pong!pong!' }
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
