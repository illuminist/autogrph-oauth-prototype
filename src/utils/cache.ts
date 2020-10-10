export const WeakMapCache = function <T extends object, D>(
  initialFunc: (arg: T) => D,
) {
  const cache = new WeakMap<T, D>()
  return {
    get: (dataObject: T): D => {
      if (!cache.has(dataObject)) {
        cache.set(dataObject, initialFunc(dataObject))
      }
      return cache.get(dataObject) as D
    },
  }
}

export const MapCache = function <T, D, S = T>(
  initialFunc: (arg: T) => D,
  serializer: (arg: T) => S = (a) => a as any,
) {
  const cache = new Map<S, D>()
  return {
    get: (dataObject: T): D => {
      const s = serializer(dataObject)
      if (!cache.has(s)) {
        cache.set(s, initialFunc(dataObject))
      }
      return cache.get(s) as D
    },
    delete: (dataObject: T): D | undefined => {
      const s = serializer(dataObject)
      const d = cache.get(s)
      cache.delete(s)
      return d
    },
  }
}

export const TimedMapCache = function <T, D>(
  initialFunc: (arg: T) => Promise<D>,
  options: { timeToLive: number } = { timeToLive: 5 * 60 * 10e3 },
) {
  interface Data {
    data: Promise<D>
    lastFetched: number
    timer: ReturnType<typeof setTimeout>
  }
  const cache = new Map<T, Data>()
  return {
    get: (input: T) => {
      const item = cache.get(input)
      if (
        !cache.has(input) ||
        (item && item.lastFetched + options.timeToLive > Date.now())
      ) {
        if (item && item.timer) clearTimeout(item.timer)
        cache.set(input, {
          data: initialFunc(input),
          lastFetched: Date.now(),
          timer: setTimeout(() => cache.delete(input), options.timeToLive),
        })
      }
      const returnItem = cache.get(input)
      return returnItem && returnItem.data
    },
  }
}

export const AsyncTimedMapCacheWithQueueTime = function <IN, OUT>(
  initialFunc: (arg: IN) => Promise<OUT>,
  options: { timeToLive: number } = { timeToLive: 5 * 60 * 10e3 },
) {
  const { timeToLive } = options

  const cache = new Map<IN, { lastFetched: number; data: Promise<OUT> }>()
  const queueTime: { lastFetched: number; input: IN }[] = []
  let timer: NodeJS.Timeout
  const sweepCache = () => {
    do {
      const item = queueTime.shift()
      if (item) {
        cache.delete(item.input)
      }
    } while (
      queueTime.length &&
      Date.now() - queueTime[0].lastFetched > timeToLive - 500
    )
    if (queueTime.length) {
      timer = setTimeout(
        sweepCache,
        queueTime[0].lastFetched - Date.now() + timeToLive,
      )
    }
  }
  const loadTrigger = (time: number) => {
    if (!timer) {
      const item = queueTime[0]
      timer = setTimeout(sweepCache, item.lastFetched + time)
    }
  }
  return {
    get: (input: IN) => {
      const item = cache.get(input)
      if (!item || item.lastFetched + options.timeToLive > Date.now()) {
        const promise = initialFunc(input)
        return promise.then((data) => {
          const lastFetched = Date.now()
          queueTime.push({ lastFetched, input })
          cache.set(input, { lastFetched, data: promise })
          loadTrigger(lastFetched)
          return data
        })
      }
      const returnItem = cache.get(input)
      return returnItem && returnItem.data
    },
  }
}

export const AsyncMapCache = MapCache
