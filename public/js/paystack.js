import axios from 'axios';

export const bookTour = async (tourId) => {
  try {
    const res = await axios(`/api/v1/bookings/checkout-session/${tourId}`);

    console.log(res);

    if (res.data.status === 'success') {
      window.location.assign(res.data.session.authorization_url);
    }
  } catch (err) {
    console.log(err);
    alert('Something went wrong while starting payment.');
  }
};

// const bookBtn = document.getElementById('book-tour');
