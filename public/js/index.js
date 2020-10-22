/* eslint-disable*/
import '@babel/polyfill';
const socket = io();
import { login, logout } from './login';
import { signup } from './signup';
import { sendMessage } from './socketRequest';
import { showAlert } from './alerts';

const loginForm = document.querySelector('.form--login'); //checks for login/signup form element
const signupForm = document.querySelector('.form--signup');
const logOutBtn = document.querySelector('.nav__el--logout');

//if loginForm element is on page then run loginForm function
if (loginForm) {
  loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    login(email, password);
  });
}

if (signupForm) {
  signupForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const passwordConfirm = document.getElementById('passwordconfirm').value;
    signup(name, email, password, passwordConfirm);
  });
}

if (logOutBtn) {
  logOutBtn.addEventListener('click', logout);
}

const alertMessage = document.querySelector('body').dataset.alert;

if (alertMessage) {
  showAlert('success', alertMessage, 20);
}

//Socket.io Section
const chatForm = document.querySelector('.field.has-addons');

if (chatForm) {
  e.preventDefault();
  sendMessage();
  const userName = document.getElementById('name');
  const text = document.getElementById('msg');

  socket.emit('message', { userName, text });
}
