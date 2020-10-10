import _ from 'lodash'
import authserver from './utils/oauthserver'
import * as functions from 'firebase-functions'
import * as admin from 'firebase-admin'
import cors from 'cors'
import express from 'express'
import bodyParser from 'body-parser'
import sig1 from 'raw-loader!./BikeSociety_EmailSignature.html'
import sig2 from 'raw-loader!./BikeSociety_Sig_MarkB.html'
import createSignature from './utils/createSignature'
import SeedRandom from 'seed-random'
import { SHA1, enc } from 'crypto-js'
import compression from 'compression'
//await fetch('http://localhost:5001/testsigoauth/us-central1/signature', {method:'GET', headers:{Authorization: 'Bearer 7976c3d64f28b80340d33f802bb8d6e08e2510f6'})

const app = express()

app.use(cors())
app.use(compression())
app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json({}))
app.use(authserver.authenticate())
app.get('/', async (req, res) => {
  const { user } = res.locals.oauth.token
  const uid = user.id
  const auth = admin.auth()
  const userData = await auth.getUser(uid)

  const text = `${userData.email}::${uid}`
  const rand = SeedRandom(text)
  const procedurals = _.times(3, (i) => {
    return {
      id: `procedural${i}`,
      name: `Procedural generated ${i}`,
      preview: 'https://cataas.com/cat',
      signature: createSignature(
        `${text}::${SHA1('' + rand()).toString(enc.Base64)}`,
      ),
    }
  })
  return res
    .send({
      uid,
      email: userData.email,
      items: [
        {
          id: 'sig1',
          name: 'BikeSociety EmailSignature',
          preview: 'https://cataas.com/cat',
          signature: sig1,
        },
        {
          id: 'sig2',
          name: 'BikeSociety Sig MarkB',
          preview: 'https://cataas.com/cat',
          signature: sig2,
        },
        ...procedurals,
      ],
    })
    .status(200)
    .end()
})

export default functions.https.onRequest(app)
