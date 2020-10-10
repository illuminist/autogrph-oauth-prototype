/// <reference path="index.d.ts"/>
import * as functions from 'firebase-functions'
import * as admin from 'firebase-admin'

admin.initializeApp()

export const helloWorld = functions.https.onRequest((request, response) => {
  functions.logger.info('Hello logs!', { structuredData: true })
  response.send('Hello from Firebase!')
})

export { default as auth } from './auth'
export { default as token } from './token'
export { default as signature } from './signature'
