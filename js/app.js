if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/sw.js')
    .then((reg) => {
      // registration worked
      console.log(`Registration succeeded. Scope is ${reg.scope}`);
    }).catch((error) => {
      // registration failed
      console.log(`Registration failed with ${error}`);
    });
}


// In the following line, you should include the prefixes
// of implementations you want to test.
window.indexedDB = window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedDB;
// DON'T use "var indexedDB = ..." if you're not in a function.
// Moreover, you may need references to some window.IDB* objects:
window.IDBTransaction = window.IDBTransaction || window.webkitIDBTransaction || window.msIDBTransaction;
window.IDBKeyRange = window.IDBKeyRange || window.webkitIDBKeyRange || window.msIDBKeyRange;
// (Mozilla has never prefixed these objects, so we don't
//  need window.mozIDB*)

let indexedDB;
const request = window.indexedDB.open('mws-restaurant', 1);
request.onerror = event => console.log('Cant open DB', event);
request.onsuccess = (event) => {
  console.log('DB opened successfully');
  indexedDB = event.target.result;
};

request.onupgradeneeded = (event) => {
  // Save the IDBDatabase interface
  const db = event.target.result;

  // Create a restaurants objectStore for this database
  const restaurantsObjectStore = db.createObjectStore('restaurants', { keyPath: 'id' });
  restaurantsObjectStore.transaction.oncomplete = event => console.log('restaurants store created', event);

  // Create an reviews objectStore for this database
  const reviewsObjectStore = db.createObjectStore('reviews', { keyPath: 'id' });
  reviewsObjectStore.transaction.oncomplete = event => console.log('reviews store created', event);
  reviewsObjectStore.createIndex('byRestaurantId', 'restaurant_id', { unique: false });
};
