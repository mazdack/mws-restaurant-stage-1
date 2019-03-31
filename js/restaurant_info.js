

let restaurant;
let newMap;

/**
 * init lazyload
 */

const lazyLoadInstance = new LazyLoad({
  elements_selector: '.lazy',
  // ... more custom settings?
});

/**
 * Initialize map as soon as the page is loaded.
 */
document.addEventListener('DOMContentLoaded', (event) => {
  initMap();
});

/**
 * Initialize leaflet map
 */
initMap = () => {
  fetchRestaurantFromURL((error, restaurant) => {
    if (error) { // Got an error!
      console.error(error);
    } else {
      newMap = L.map('map', {
        center: [restaurant.latlng.lat, restaurant.latlng.lng],
        zoom: 16,
        scrollWheelZoom: false,
        keyboard: false,
      });
      L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.jpg70?access_token={mapboxToken}', {
        mapboxToken: 'pk.eyJ1IjoibWF6ZGFjayIsImEiOiJjanJnOGJiNHIwMThnNGJvNGJuNnU5ZTVoIn0.GGCpQ_6VyTGDh5jP8BEX8Q',
        maxZoom: 18,
        attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, '
          + '<a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, '
          + 'Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
        id: 'mapbox.streets',
      }).addTo(newMap);
      fillBreadcrumb();
      DBHelper.mapMarkerForRestaurant(self.restaurant, newMap);
    }
  });
};

/**
 * Get current restaurant from page URL.
 */
fetchRestaurantFromURL = (callback) => {
  if (self.restaurant) { // restaurant already fetched!
    callback(null, self.restaurant);
    return;
  }
  const id = getParameterByName('id');
  if (!id) { // no id found in URL
    error = 'No restaurant id in URL';
    callback(error, null);
  } else {
    DBHelper.fetchRestaurantById(id, (restaurantError, restaurant) => {
      DBHelper.fetchReviewsByRestaurantId(id, (reviewsError, reviews) => {
        if (!restaurant || !reviews) {
          console.error(restaurantError, reviewsError);
          return;
        }
        restaurant.reviews = reviews;
        self.restaurant = restaurant;
        fillRestaurantHTML();
        callback(null, restaurant);
      });
    });
  }
};

/**
 * Create restaurant HTML and add it to the webpage
 */
fillRestaurantHTML = (restaurant = self.restaurant) => {
  const name = document.getElementById('restaurant-name');
  name.innerHTML = restaurant.name;

  const address = document.getElementById('restaurant-address');
  address.innerHTML = restaurant.address;

  const image = document.getElementById('restaurant-img');
  image.classList.add('restaurant-img', 'lazy');
  image.setAttribute('data-src', DBHelper.imageUrlForRestaurant(restaurant));
  image.alt = `Image of ${restaurant.name}`;

  if (lazyLoadInstance) {
    lazyLoadInstance.update();
  }

  const cuisine = document.getElementById('restaurant-cuisine');
  cuisine.innerHTML = restaurant.cuisine_type;

  // fill operating hours
  if (restaurant.operating_hours) {
    fillRestaurantHoursHTML();
  }
  // fill reviews
  fillReviewsHTML();

  // fill add review form
  fillAddReviewForm();
};

/**
 * Create restaurant operating hours HTML table and add it to the webpage.
 */
fillRestaurantHoursHTML = (operatingHours = self.restaurant.operating_hours) => {
  const hours = document.getElementById('restaurant-hours');
  for (const key in operatingHours) {
    const row = document.createElement('tr');

    const day = document.createElement('td');
    day.innerHTML = key;
    row.appendChild(day);

    const time = document.createElement('td');
    time.innerHTML = operatingHours[key];
    row.appendChild(time);

    hours.appendChild(row);
  }
};

/**
 * Create all reviews HTML and add them to the webpage.
 */
fillReviewsHTML = (reviews = self.restaurant.reviews) => {
  let startTabIndex = 7;
  const container = document.getElementById('reviews-container');
  const title = document.createElement('h3');
  title.innerHTML = 'Reviews';
  container.appendChild(title);

  if (!reviews) {
    const noReviews = document.createElement('p');
    noReviews.innerHTML = 'No reviews yet!';
    container.appendChild(noReviews);
    return;
  }
  const ul = document.getElementById('reviews-list');
  reviews.forEach((review) => {
    const reviewElement = createReviewHTML(review);
    reviewElement.tabIndex = startTabIndex++;
    ul.appendChild(reviewElement);
  });
  container.appendChild(ul);
};

/**
 * Create review HTML and add it to the webpage.
 */
createReviewHTML = (review) => {
  const li = document.createElement('li');
  const name = document.createElement('p');
  name.innerHTML = review.name;
  li.appendChild(name);

  const date = document.createElement('p');
  date.innerHTML = new Date(review.createdAt);
  li.appendChild(date);

  const rating = document.createElement('p');
  rating.innerHTML = `Rating: ${review.rating}`;
  li.appendChild(rating);

  const comments = document.createElement('p');
  comments.innerHTML = review.comments;
  li.appendChild(comments);

  return li;
};

const fillAddReviewForm = (restaurant = self.restaurant) => {
  const container = document.getElementById('reviews-container');
  const form = document.getElementById('reviews-add-review-form');
  document.getElementById('review-form-restaurant-id').setAttribute('value', restaurant.id);
  form.addEventListener('submit', (event) => {
    event.preventDefault();
    const sendReview = () => {
      const data = {
        restaurant_id: document.getElementById('review-form-restaurant-id').value,
        name: document.getElementById('review-form-name').value,
        rating: document.getElementById('review-form-rating').value,
        comments: document.getElementById('review-form-comments').value,
      };
      fetch(DBHelper.REVIEWS_DATABASE_URL, {
        method: 'POST',
        body: JSON.stringify(data),
      }).then(() => {
        window.location.reload();
      }).catch((error) => {
        console.log('Error while submitting review');
        console.error(error);
        console.log('Will try later');
        setTimeout(sendReview, 500);
      });
    };

    sendReview();
  });
  container.appendChild(form);


  // const form = document.createElement('form');
  // const restaurantIdInput = document.createElement('input');
  // restaurantIdInput.setAttribute('hidden', true);
  // restaurantIdInput.setAttribute('name', 'restaurant_id');
  // restaurantIdInput.setAttribute('value', restaurant.id);
  // form.appendChild(restaurantIdInput);

  // const nameInput = document.createElement('input');
  // nameInput.setAttribute('name', 'name');
  // form.append(nameInput);

  // const ratingInput = document.createElement('input');
  // ratingInput.setAttribute('name', 'rating');
  // form.appendChild(ratingInput);

  // const reviewInput = document.createElement('input');
  // container.appendChild(form);
};

/**
 * Add restaurant name to the breadcrumb navigation menu
 */
fillBreadcrumb = (restaurant = self.restaurant) => {
  const breadcrumb = document.getElementById('breadcrumb');
  const li = document.createElement('li');
  li.setAttribute('aria-current', 'page');
  li.innerHTML = restaurant.name;
  breadcrumb.appendChild(li);
};

/**
 * Get a parameter by name from page URL.
 */
getParameterByName = (name, url) => {
  if (!url) url = window.location.href;
  name = name.replace(/[\[\]]/g, '\\$&');
  const regex = new RegExp(`[?&]${name}(=([^&#]*)|&|#|$)`);
  const results = regex.exec(url);
  if (!results) return null;
  if (!results[2]) return '';
  return decodeURIComponent(results[2].replace(/\+/g, ' '));
};
