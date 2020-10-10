type CB = () => void
const createCallbackHandler = () => {
  const callbackSet = new Set<CB>()
  return {
    setHandler: (fn: CB) => {
      callbackSet.add(fn)
      return () => {
        callbackSet.delete(fn)
      }
    },
    trigger: () => callbackSet.forEach((fn) => fn()),
  }
}

const createReadyCallback = () => {
  const callbackSet = new Set<CB>()
  let ready = false
  return {
    setHandler: async (fn: CB) => {
      callbackSet.add(fn)
      if (ready) fn()
      return () => {
        callbackSet.delete(fn)
      }
    },
    trigger: () => {
      ready = true
      callbackSet.forEach((fn) => fn())
    },
  }
}

export const {
  setHandler: callOnAuthClear,
  trigger: handleAuthClearCallback,
} = createCallbackHandler()

export const {
  setHandler: setCallOnAppInitialize,
  trigger: handleAppInitialize,
} = createReadyCallback()
