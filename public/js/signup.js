/* eslint-disable*/
import axios from 'axios';
import { showAlert } from './alerts';

// eslint-disable-next-line import/prefer-default-export
export const signup = async (name, email, password, passwordConfirm) => {
  try {
    const res = await axios({
      method: 'POST',
      url: '/api/v1/users/signup', //this url is relative url
      data: {
        name,
        email,
        password,
        passwordConfirm,
      },
    });

    if (res.data.status === 'success') {
      showAlert(res.data.status, 'Account created successfully');
      //after signing up, load the home page after 1 and a half seconds
      window.setTimeout(() => {
        location.assign('/');
      }, 1500);
    }
  } catch (err) {
    showAlert('error', err.response.data.message);
  }
};
