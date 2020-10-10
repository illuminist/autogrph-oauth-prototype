import authserver from './utils/oauthserver'
import * as functions from 'firebase-functions'
import cors from 'cors'
import express from 'express'
import bodyParser from 'body-parser'

const app = express()

app.use(cors())
app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json({}))
app.use(authserver.authenticate())

export default functions.https.onRequest(app)
