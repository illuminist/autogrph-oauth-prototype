import * as functions from 'firebase-functions'
import cors from 'cors'
import _ from 'lodash'
import express from 'express'
import * as url from 'url'

type OrPromise<D> = D | Promise<D>

export type GetOptions = {
  limit: number
}

export const makeRestEndPoint = <
  InputData extends any,
  FullData extends any
>(options: {
  list?: (req: functions.https.Request) => OrPromise<any>
  get?: (req: functions.https.Request) => OrPromise<FullData>
  save?: (req: functions.https.Request) => OrPromise<FullData>
  create?: (req: functions.https.Request) => OrPromise<FullData>
  update?: (req: functions.https.Request) => OrPromise<FullData>
  delete?: (req: functions.https.Request) => OrPromise<FullData>

  dbConnect?: () => Promise<any> | void
  middlewares?: ((
    req: functions.https.Request,
    res: functions.Response,
    next: () => any,
  ) => any)[]
  cors?: cors.CorsOptions
  route?: string
}) => {
  const { route = '/', cors: inCorOptions = {}, middlewares = [] } = options

  const corOptions = {
    origin: true,
    allowedHeaders: ['Content-Type', 'Authorization'],
    optionsSuccessStatus: 204,
    preflightContinue: false,
    ...inCorOptions,
  }

  const wrapFn = (name: string) => async (
    req: functions.https.Request,
    res: functions.Response,
  ) => {
    try {
      await options.dbConnect?.()
      if (options[name]) {
        const data = await options[name](req as any)
        res.status(200).send(data)
      } else {
        res.status(405).send({})
      }
    } catch (e) {
      console.error(e)
      res.status(500).send({ error: e })
    } finally {
      res.end()
    }
  }

  const app = express()
    .use(express.json())
    .use(express.urlencoded({ extended: true }))
    .options(
      url.resolve(route, '/'),
      cors({
        ...corOptions,
        methods: [
          ...(!!options.list ? ['GET'] : []),
          ...(!!options.save ? ['POST'] : []),
          ...(!!options.create ? ['PUT'] : []),
        ],
      }),
    )
    .options(
      url.resolve(route, '/:id'),
      cors({
        ...corOptions,
        methods: [
          ...(!!options.get ? ['GET'] : []),
          ...(!!options.save ? ['POST'] : []),
          ...(!!options.update ? ['PATCH'] : []),
          ...(!!options.delete ? ['DELETE'] : []),
        ],
      }),
    )

  // middlewares.forEach((mid) => app.use(mid))

  return app
    .get(url.resolve(route, '/'), cors(corOptions), wrapFn('list'))
    .get(url.resolve(route, '/:id'), cors(corOptions), wrapFn('get'))
    .post(url.resolve(route, '/'), cors(corOptions), wrapFn('save'))
    .post(url.resolve(route, '/:id'), cors(corOptions), wrapFn('save'))
    .put(url.resolve(route, '/'), cors(corOptions), wrapFn('create'))
    .patch(url.resolve(route, '/:id'), cors(corOptions), wrapFn('update'))
    .delete(url.resolve(route, '/:id'), cors(corOptions), wrapFn('delete'))
}
