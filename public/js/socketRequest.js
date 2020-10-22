/* eslint-disable*/
import axios from 'axios';

export const sendMessage = async () => {
  await axios({
    method: 'GET',
    url: '/api/v1/users/chat',
  });
};
