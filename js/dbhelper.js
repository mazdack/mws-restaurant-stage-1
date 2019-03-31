/**
 * Common database helper functions.
 */
class DBHelper {
  static get DATABASE_URL() {
    const port = 1337; // Change this to your server port
    return `http://localhost:${port}`;
  }

  static get RESTAURANT_DATABASE_URL() {
    return `${DBHelper.DATABASE_URL}/restaurants`;
  }

  static get REVIEWS_DATABASE_URL() {
    return `${DBHelper.DATABASE_URL}/reviews`;
  }

  /**
   * Fetch all restaurants.
   */
  static fetchRestaurants(callback) {
    fetch(DBHelper.RESTAURANT_DATABASE_URL)
      .then(response => response.json())
      .then((restaurants) => {
        if (indexedDB) {
          const objectStore = indexedDB.transaction(['restaurants'], 'readwrite').objectStore('restaurants');

          restaurants.forEach((restaurant) => {
            // console.log('add restaurant to db', restaurant);
            const request = objectStore.add(restaurant);
            request.onsuccess = () => console.log(`restaurant ${restaurant.id} saved to DB`);
          });
        }
        callback(null, restaurants);
      })
      .catch((error) => {
        if (indexedDB) {
          console.log('returning restaurants from DB');
          const objectStore = indexedDB.transaction(['restaurants'], 'readwrite').objectStore('restaurants');
          const request = objectStore.getAll();

          request.onsuccess = (event) => {
            callback(null, event.target.result);
          };

          request.onerror = () => {
            callback(`Request failed. Returned status of ${error.message}`, null);
          };

          return;
        }

        callback(`Request failed. Returned status of ${error.message}`, null);
      });
    //
    // let xhr = new XMLHttpRequest();
    // xhr.open('GET', DBHelper.DATABASE_URL);
    // xhr.onload = () => {
    //   if (xhr.status === 200) { // Got a success response from server!
    //     const json = JSON.parse(xhr.responseText);
    //     const restaurants = json.restaurants;
    //     callback(null, restaurants);
    //   } else { // Oops!. Got an error from server.
    //     const error = (`Request failed. Returned status of ${xhr.status}`);
    //     callback(error, null);
    //   }
    // };
    // xhr.send();
  }

  /**
   * Fetch a restaurant by its ID.
   */
  static fetchRestaurantById(id, callback) {
    // fetch all restaurants with proper error handling.
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        const restaurant = restaurants.find(r => r.id === parseInt(id, 10));
        if (restaurant) { // Got the restaurant
          callback(null, restaurant);
        } else { // Restaurant does not exist in the database
          callback('Restaurant does not exist', null);
        }
      }
    });
  }

  /**
   * Fetch restaurants by a cuisine type with proper error handling.
   */
  static fetchRestaurantByCuisine(cuisine, callback) {
    // Fetch all restaurants  with proper error handling
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        // Filter restaurants to have only given cuisine type
        const results = restaurants.filter(r => r.cuisine_type == cuisine);
        callback(null, results);
      }
    });
  }

  /**
   * Fetch restaurants by a neighborhood with proper error handling.
   */
  static fetchRestaurantByNeighborhood(neighborhood, callback) {
    // Fetch all restaurants
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        // Filter restaurants to have only given neighborhood
        const results = restaurants.filter(r => r.neighborhood == neighborhood);
        callback(null, results);
      }
    });
  }

  /**
   * Fetch restaurants by a cuisine and a neighborhood with proper error handling.
   */
  static fetchRestaurantByCuisineAndNeighborhood(cuisine, neighborhood, callback) {
    // Fetch all restaurants
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        let results = restaurants;
        if (cuisine != 'all') { // filter by cuisine
          results = results.filter(r => r.cuisine_type == cuisine);
        }
        if (neighborhood != 'all') { // filter by neighborhood
          results = results.filter(r => r.neighborhood == neighborhood);
        }
        callback(null, results);
      }
    });
  }

  /**
   * Fetch all neighborhoods with proper error handling.
   */
  static fetchNeighborhoods(callback) {
    // Fetch all restaurants
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        // Get all neighborhoods from all restaurants
        const neighborhoods = restaurants.map((v, i) => restaurants[i].neighborhood);
        // Remove duplicates from neighborhoods
        const uniqueNeighborhoods = neighborhoods.filter((v, i) => neighborhoods.indexOf(v) == i);
        callback(null, uniqueNeighborhoods);
      }
    });
  }

  /**
   * Fetch all cuisines with proper error handling.
   */
  static fetchCuisines(callback) {
    // Fetch all restaurants
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        // Get all cuisines from all restaurants
        const cuisines = restaurants.map((v, i) => restaurants[i].cuisine_type);
        // Remove duplicates from cuisines
        const uniqueCuisines = cuisines.filter((v, i) => cuisines.indexOf(v) == i);
        callback(null, uniqueCuisines);
      }
    });
  }

  /**
   * Restaurant page URL.
   */
  static urlForRestaurant(restaurant) {
    return (`./restaurant.html?id=${restaurant.id}`);
  }

  /**
   * Restaurant image URL.
   */
  static imageUrlForRestaurant(restaurant) {
    return (`/img/${restaurant.photograph}.jpg`);
  }

  /**
   * Favorite image url.
   */
  static imageUrlForFavorite(isFavorite) {
    const name = isFavorite ? 'favoriteActive' : 'favorite';
    return `/img/${name}.svg`;
  }
  /**
   * Map marker for a restaurant.
   */
  static mapMarkerForRestaurant(restaurant, map) {
    // https://leafletjs.com/reference-1.3.0.html#marker
    const marker = new L.marker([restaurant.latlng.lat, restaurant.latlng.lng],
      {
        title: restaurant.name,
        alt: restaurant.name,
        url: DBHelper.urlForRestaurant(restaurant),
      });
    marker.addTo(newMap);
    return marker;
  }
  /* static mapMarkerForRestaurant(restaurant, map) {
    const marker = new google.maps.Marker({
      position: restaurant.latlng,
      title: restaurant.name,
      url: DBHelper.urlForRestaurant(restaurant),
      map: map,
      animation: google.maps.Animation.DROP}
    );
    return marker;
  } */

  static fetchReviewsByRestaurantId(restaurantId, callback) {
    fetch(`${DBHelper.REVIEWS_DATABASE_URL}?restaurant_id=${restaurantId}`)
      .then(response => response.json())
      .then((reviews) => {
        if (indexedDB) {
          const objectStore = indexedDB.transaction(['reviews'], 'readwrite').objectStore('reviews');

          reviews.forEach((review) => {
            // console.log('add review to db', review);
            const request = objectStore.add(review);
            request.onsuccess = () => console.log(`review ${review.id} saved to DB`);
          });
        }
        callback(null, reviews);
      })
      .catch((error) => {
        if (indexedDB) {
          console.log('returning reviews from DB');
          const objectStore = indexedDB.transaction(['reviews'], 'readwrite').objectStore('reviews');
          const request = objectStore.getAll();

          request.onsuccess = (event) => {
            callback(null, event.target.result);
          };

          request.onerror = () => {
            callback(`Request failed. Returned status of ${error.message}`, null);
          };

          return;
        }

        callback(`Request failed. Returned status of ${error.message}`, null);
      });
  }
}
