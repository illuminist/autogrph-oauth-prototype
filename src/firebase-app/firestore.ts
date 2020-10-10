import firebase from 'firebase/app'
import 'firebase/firestore'
import { setCallOnAppInitialize } from './common-pool'

type DocumentData = firebase.firestore.DocumentData
type QueryDocumentSnapshot<
  T = DocumentData
> = firebase.firestore.QueryDocumentSnapshot<T>
type QuerySnapshot<T = DocumentData> = firebase.firestore.QuerySnapshot<T>
type DocumentSnapshot<T = DocumentData> = firebase.firestore.DocumentSnapshot<T>
type CollectionReference<
  T = DocumentData
> = firebase.firestore.CollectionReference<T>
type DocumentReference<T = DocumentData> = firebase.firestore.DocumentReference<
  T
>
type Query<T = DocumentData> = firebase.firestore.Query<T>
type DocumentChange<T = DocumentData> = firebase.firestore.DocumentChange<T>

let inited = false
const initFirestore = () => {
  if (!inited) {
    inited = true
    if (process.env.NODE_ENV !== 'production') {
      // Note that the Firebase Web SDK must connect to the WebChannel port
      const firestore = firebase.firestore()
      firestore.settings({
        host:
          process.env.FIRESTORE_EMULATOR_HOST ||
          process.env.REACT_APP_FIRESTORE_EMULATOR_HOST ||
          'localhost:8080',
        ssl: false,
      })
    }
  }
}

setCallOnAppInitialize(initFirestore)
