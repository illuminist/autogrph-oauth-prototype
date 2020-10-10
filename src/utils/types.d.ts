import * as React from 'react'

export type PropOf<T> = T extends React.Component<infer P>
  ? P
  : T extends React.ComponentType<infer P>
  ? P
  : never

export type Arg<A> = A extends (arg: infer B) => Promise<infer C> ? B : never
export type Rtn<A> = A extends (arg: infer B) => Promise<infer C> ? C : never
