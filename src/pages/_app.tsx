import 'firebase/auth'
import initFirebase from 'firebase-app/init'
import 'firebase-app/firestore'
import { AppProps } from 'next/app'
import CssBaseline from '@material-ui/core/CssBaseline'

initFirebase({
  apiKey: 'AIzaSyAhXKcN2E3SyIIhoG13pxKZCzhnJpHbQ2U',
  authDomain: 'testsigoauth.firebaseapp.com',
  databaseURL: 'https://testsigoauth.firebaseio.com',
  projectId: 'testsigoauth',
  storageBucket: 'testsigoauth.appspot.com',
  messagingSenderId: '107940456187',
  appId: '1:107940456187:web:81d1747f883fa2a896b25e',
})


const MyApp = ({ Component, pageProps }: AppProps) => {
  return (
    <>
      <CssBaseline />
      <Component {...pageProps} />
    </>
  )
}

export default MyApp
