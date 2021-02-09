import firebase from 'firebase'
var config = { /* COPY THE ACTUAL CONFIG FROM FIREBASE CONSOLE */
    apiKey: "AIzaSyAHg7yM2-OIp2vTgnrL9RSPuQGNImpSOIg",
    authDomain: "nurlan-dev.firebaseapp.com",
    databaseURL:  "https://nurlan-dev.firebaseio.com",
    projectId: "nurlan-dev",
    storageBucket: "nurlan-dev.appspot.com"
};
var fire = firebase.initializeApp(config);
export default fire;