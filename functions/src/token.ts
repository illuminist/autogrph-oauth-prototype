import authserver from './utils/oauthserver'
import * as functions from 'firebase-functions'
import cors from 'cors'
import express from 'express'
import bodyParser from 'body-parser'

//await fetch('http://localhost:5001/testsigoauth/us-central1/token', {method:'POST', headers:{'Content-Type':'application/json'},body:JSON.stringify({"code":"myaojpjapwojawapoawdwa","grant_type":"authorization_code","client_secret":"CLIENT_SECRET","redirect_uri":"https://script.google.com/macros/d/1jAtbxTTMYibywo-KFywAuHX6P02WM2NipaHCKVGO44LNeb9bU5iJKVye/usercallback","client_id":"CLIENT_ID"})})

const app = express()


app.use(cors())
app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json({}))
app.use(authserver.token())

export default functions.https.onRequest(app)
