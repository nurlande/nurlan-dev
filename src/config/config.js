import firebase from './node_modules/firebase';

var firebaseConfig = {
    apiKey: "AIzaSyAHg7yM2-OIp2vTgnrL9RSPuQGNImpSOIg",
    authDomain: "nurlan-dev.firebaseapp.com",
    databaseURL:  "https://nurlan-dev.firebaseio.com",
    projectId: "nurlan-dev",
    storageBucket: "nurlan-dev.appspot.com"
  };
  firebase.initializeApp(firebaseConfig);


export default firebase;