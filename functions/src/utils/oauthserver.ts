import OAuth2Server from 'express-oauth-server'
import * as admin from 'firebase-admin'
import { AuthorizationCode, Token } from 'oauth2-server'
import crypto from 'crypto'

const clientDataMap: { [clientId: string]: { secret?: string } } = {
  TESTGMAILSIGNATURE: { secret: 'SUPERSECRETHUSKY' },
}

const oauth = new OAuth2Server({
  model: {
    saveAuthorizationCode: async (code, client, user) => {
      console.log('save code')
      console.log(code, client, user)
      const firestore = admin.firestore()

      const ref = firestore.collection('oauthcode').doc()
      const savedCode = {
        ...code,
        client,
        user,
      }
      await ref.set(savedCode)
      return savedCode
    },
    getAuthorizationCode: async (authorizationCode) => {
      console.log('get code')
      const firestore = admin.firestore()
      console.log(authorizationCode)
      const ref = firestore.collection('oauthcode').doc(authorizationCode)
      const codeSnap = await ref.get()
      const codeData = codeSnap.data()
      console.log(codeData)
      codeData.expiresAt = new Date(codeData.expiresAt)
      console.log(codeData)
      return codeData as AuthorizationCode
    },

    revokeAuthorizationCode: async (authorizationCode) => {
      console.log('revoke code')
      const firestore = admin.firestore()
      const ref = firestore
        .collection('oauthcode')
        .doc(authorizationCode.authorizationCode)
      const result = await ref.delete()
      return true
    },

    getAccessToken: async (accessToken) => {
      console.log('get token')
      console.log(accessToken)

      const firestore = admin.firestore()
      const ref = firestore.collection('oauthtoken').doc(accessToken)
      const tokenSnap = await ref.get()
      const tokenData = tokenSnap.data()
      tokenData.accessTokenExpiresAt = tokenData.accessTokenExpiresAt.toDate()
      tokenData.refreshTokenExpiresAt = tokenData.refreshTokenExpiresAt.toDate()
      console.log(tokenData)
      return tokenData as Token
    },

    getRefreshToken: async (refreshToken) => {
      console.log('get refresh token')
      console.log(refreshToken)

      const firestore = admin.firestore()
      const queryRef = firestore
        .collection('oauthtoken')
        .where('refreshToken', '==', refreshToken)
      const querySnap = await queryRef.get()
      const token = (querySnap.docs[0]?.data as unknown) as Token
      if (token) {
        return {
          refreshToken,
          refreshTokenExpiresAt: (token.refreshTokenExpiresAt as any).toDate(),
          scope: token.scope,
          user: token.user,
          client: token.client,
        }
      }
    },

    saveToken: async (token, client, user) => {
      console.log('save token')
      console.log(token, client, user)
      const firestore = admin.firestore()
      const ref = firestore.collection('oauthtoken').doc(token.accessToken)
      const savedToken = { ...token, client, user }
      await ref.set(savedToken)

      return savedToken
    },

    getClient: async (clientId, clientSecret) => {
      console.log('get client')
      const clientData = clientDataMap[clientId]
      if (
        !clientData.secret ||
        (clientData.secret.length === clientSecret.length &&
          crypto.timingSafeEqual(
            Buffer.from(clientData.secret),
            Buffer.from(clientSecret),
          ))
      ) {
        return {
          id: clientId,
          grants: ['authorization_code'],
          accessTokenLifetime: 60 * 60, // 60 minutes
        }
      }
    },

    verifyScope: async () => {
      console.log('verify scope')
      return true
    },
  },
})

export default oauth
