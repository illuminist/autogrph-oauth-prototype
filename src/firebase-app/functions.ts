import * as _ from 'lodash'
import firebase from 'firebase/app'
// import firebaseConfig from 'configs/firebase'
import 'firebase/functions'

export type Arg<A> = A extends (arg: infer B) => any ? B : {}
export type Rtn<A> = A extends (arg?: any) => Promise<infer C> ? C : void

// let functions: ReturnType<typeof firebase.functions> | null = null

export const makeMakeCallableFunction = (region?: string) => <T>(
  fname: string,
) => {
  return async (arg: Arg<T>) => {
    const functions = firebase.app().functions(region)
    if (process.env.NODE_ENV !== 'production')
      functions.useFunctionsEmulator(process.env.FUNCTIONS_EMULATOR_HOST || '')

    const fn = functions.httpsCallable(fname)
    const result = (await fn(arg)) as any
    if (result.data?.error) {
      if (typeof result.data.error === 'string') {
        throw new Error(result.data.error)
      }
      if (result.data.error) {
        throw result.data.error
      }
    }
    return result.data as Rtn<T>
  }
}

// export const makeRequestableFunction = <T>(fname: string) => {
//   const url = new URL(fname, firebaseConfig.functionsUrl)
//   return async (data: Arg<T>) => {
//     const response = await fetch(url.toString(), {
//       method: 'POST',
//       mode: 'cors',
//       headers: {
//         'Content-Type': 'application/json',
//       },
//       body: JSON.stringify(data),
//     })
//     const result = await response.json()
//     if (result?.error) {
//       throw new Error(result.error)
//     }
//     return result.data as Rtn<T>
//   }
// }
