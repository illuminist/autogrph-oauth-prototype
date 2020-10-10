import * as React from 'react'
import Card from '@material-ui/core/Card'
import CardActions from '@material-ui/core/CardActions'
import CardHeader from '@material-ui/core/CardHeader'
import CardContent from '@material-ui/core/CardContent'
import CircularProgress from '@material-ui/core/CircularProgress'

import Container from '@material-ui/core/Container'
import FormGroup from '@material-ui/core/FormGroup'
import Button from '@material-ui/core/Button'
import TextField from '@material-ui/core/TextField'
import Typography from '@material-ui/core/Typography'
import { Formik, Form, Field } from 'formik'

import firebase from 'firebase/app'
import 'firebase/firestore'
import { useRouter } from 'next/router'
import { useFirebaseUser } from 'firebase-app/auth'
import qs from 'qs'
import urlJoin from 'url-join'

const initialSignin = {
  email: '',
  password: '',
}

const clientDataMap: { [clientId: string]: { name: string } } = {
  TESTGMAILSIGNATURE: { name: 'Test Email Signature' },
}

// http://localhost:3000/oauth?client_id=CLIENT_ID&response_type=code&redirect_uri=https://script.google.com/macros/d/1jAtbxTTMYibywo-KFywAuHX6P02WM2NipaHCKVGO44LNeb9bU5iJKVye/usercallback&state=ADEpC8zQ1UBxbYfxUoiaImbwHpsFdxoYjS96np02H8ODgnKCckWx3NpUDoG1VzGA6rt7JMQ_n7TUDfchOHXLaUllGc1xlXiciBJjlY3lv-OvWbthnt37XmnDgwldvTk7M06hZfXlXD6mRPWls0Gs4EnGyMABtCrLfpYipL6T3calEEn7Jt0_OkK_xQbaQftd9_W7LZtvbulwGZuI3F_rgyrbl1fwVLl5sITiT5YIWt_WFbpIKt5KU09LoWcowb6P6VqY1iqX51qH_YXDhlPeO3fhOxdfwCc6pFxQcq-x9HvJgcFMWuIuvJFdKwYEQeJsiMddwFddQ7wV&scope=SERVICE_SCOPE_REQUESTS

const Oauth = () => {
  const [firstRender, setFirstRender] = React.useState(true)
  const router = useRouter()

  const user = useFirebaseUser()

  React.useEffect(() => {
    setFirstRender(false)
  }, [])

  const firstCheckRef = React.useRef(true)
  React.useEffect(() => {
    if (firstCheckRef.current) {
      firstCheckRef.current = false
      return
    }
    if (!('client_id' in router.query)) router.push('/')
  }, [router.query])

  const handleSignin = React.useCallback(
    async (values: typeof initialSignin) => {
      const auth = firebase.auth()
      try {
        await auth.signInWithEmailAndPassword(values.email, values.password)
      } catch (e) {
        if (e.code === 'auth/user-not-found') {
          await auth.createUserWithEmailAndPassword(
            values.email,
            values.password,
          )
        } else {
          throw e
        }
      }
    },
    [],
  )

  const handleSignout = React.useCallback(async () => {
    await firebase.auth().signOut()
  }, [])

  const handleAuthorize = React.useCallback(async () => {
    if (!user) return
    const firestore = firebase.firestore()

    const ref = firestore.collection('oauthcode').doc()
    const code = {
      authorizationCode: ref.id,
      expiresAt: Date.now() + 1e3 * 60,
      scope: router.query.scope,
      client: {
        id: router.query.client_id,
      },
      user: {
        id: user.uid,
      },
    }

    await ref.set(code)

    const query = qs.stringify({
      code: ref.id,
      state: router.query.state,
    })

    window.location.href = urlJoin(
      router.query.redirect_uri as string,
      '?' + query,
    )
  }, [router.query, user])

  const clientId = router.query?.client_id as string
  const clientData = clientDataMap[clientId]

  return (
    <Container maxWidth="sm">
      {firstRender || user === undefined ? (
        <CircularProgress size={150} />
      ) : !clientData ? (
        <Typography color="error">
          No registered client with ID {clientId}
        </Typography>
      ) : !user ? (
        <Formik initialValues={initialSignin} onSubmit={handleSignin}>
          <Form>
            <Card>
              <CardHeader title="Sign in" />
              <CardContent>
                <FormGroup>
                  <Field
                    as={TextField}
                    name="email"
                    type="email"
                    label="email"
                    margin="normal"
                    variant="outlined"
                  />
                  <Field
                    as={TextField}
                    name="password"
                    type="password"
                    label="password"
                    margin="normal"
                    variant="outlined"
                  />
                  <Button type="submit" variant="contained" color="primary">
                    Signin
                  </Button>
                </FormGroup>
              </CardContent>
            </Card>
          </Form>
        </Formik>
      ) : (
        <Card>
          <CardHeader title="Authorize" />
          <CardContent>
            <Typography>Authoize for app: {clientData.name}</Typography>
            <Typography>Account: {user.email}</Typography>
          </CardContent>
          <CardActions>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              onClick={handleAuthorize}>
              Click here to authorize the app
            </Button>
            <Button
              variant="outlined"
              color="secondary"
              onClick={handleSignout}>
              Sign out
            </Button>
          </CardActions>
        </Card>
      )}
    </Container>
  )
}

export default Oauth
