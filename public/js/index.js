/* eslint-disable */
// import '@babel/polyfill';
// import 'core-js/stable';
// import 'regenerator-runtime/runtime';
// // import leaflet from 'leaflet';
// import L from 'leaflet';

// import { login } from './login';

// // dom elements
// const loginForm = document.querySelector('.form');

// //values
// const email = document.getElementById('email').value;
// const password = document.getElementById('password').value;

// if (loginForm)
//   loginForm('.form').addEventListener('submit', (e) => {
//     e.preventDefault();

//     login(email, password);
//   });

import 'core-js/stable';
import 'regenerator-runtime/runtime';
import L from 'leaflet';

import { login, logout } from './login';
import { updateSettings } from './updateSettings';
import { bookTour } from './paystack';

// DOM elements
const loginForm = document.querySelector('.form--login');
const logOutBtn = document.querySelector('.nav__el--logout');
const userDataForm = document.querySelector('.form-user-data');
const userPasswordForm = document.querySelector('.form-user-password');
const bookBtn = document.getElementById('book-tour');
// console.log('userPasswordForm:', userPasswordForm);

if (loginForm) {
  loginForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    login(email, password);
  });
}

if (logOutBtn) {
  // console.log('Logout button found');
  logOutBtn.addEventListener('click', logout);
}
if (userDataForm) {
  // console.log('Logout button found');
  userDataForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const form = new FormData();
    form.append('name', document.getElementById('name').value);
    form.append('email', document.getElementById('email').value);
    form.append('photo', document.getElementById('photo').files);
    console.log(form);

    updateSettings(form, 'data');
  });
}
if (userPasswordForm) {
  // console.log('Logout button found');
  userPasswordForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    document.querySelector('.btn--save--password').textContent = 'updating...';

    const passwordCurrent = document.getElementById('password-current').value;
    const password = document.getElementById('password').value;
    const passwordConfirm = document.getElementById('password-confirm').value;
    await updateSettings(
      { passwordCurrent, password, passwordConfirm },
      'password',
    );

    document.querySelector('.btn--save--password').textContent =
      'save passwords';
    document.getElementById('password-current').value = '';
    document.getElementById('password').value = '';
    document.getElementById('password-confirm').value = '';
  });
}
if (bookBtn) {
  bookBtn.addEventListener('click', (e) => {
    // console.log(bookBtn);
    e.target.textContent = 'Processing...';
    // console.log('clicked');

    const { tourId } = e.target.dataset;

    bookTour(tourId);
  });
}
