import React from 'react';
// import firebase from 'firebase';
import fire from './../fire';

function Storage(collectionName) {
    const db = fire.firestore();
    db.collection(collectionName).get().then(querySnapshot => {
      const data = querySnapshot.docs.map(doc => {
        const dats = doc.data()
        return { id: doc.id, ...dats }
      });
      return data;
    });
}

export default Storage;