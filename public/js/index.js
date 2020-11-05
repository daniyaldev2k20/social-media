/* eslint-disable*/
const socket = io();
import '@babel/polyfill';
import { login, logout } from './login';
import { signup } from './signup';
import { showAlert } from './alerts';
import { startChat } from './start-chat';

const loginForm = document.querySelector('.form--login'); //checks for login/signup form element
const signupForm = document.querySelector('.form--signup');
const logOutBtn = document.querySelector('.nav__el--logout');

//DOM elements for Chat API
const chatForm = document.getElementById('chat-form');
const chatMessages = document.querySelector('.chat-messages');
const userList = document.getElementById('users');

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

if (chatForm && chatMessages && userList) {
  startChat();

  //Join Chatroom
  socket.emit('join', () => {
    console.log(`User has joined the chatroom`);
  });

  // Message from server
  socket.on('message', (message) => {
    console.log(message);
    outputMessage(message);

    // Scroll down messages
    chatMessages.scrollTop = chatMessages.scrollHeight;
  });

  // Message submit
  chatForm.addEventListener('submit', (e) => {
    e.preventDefault();

    //Get message text
    const msg = e.target.elements.msg.value;

    // Emit message to server
    socket.emit('typing', msg);
    // Emit message to server
    socket.emit('chatMessage', msg);

    // Clear input
    e.target.elements.msg.value = '';
    e.target.elements.msg.focus();
  });
}

// Output message to DOM
function outputMessage(message) {
  const div = document.createElement('div');
  div.classList.add('message');
  div.innerHTML = `
  p.meta
    | ${message.username} 
    span ${message.time}
  p.text
    | ${message.text}`;
  document.querySelector('.chat-messages').appendChild(div);
}
