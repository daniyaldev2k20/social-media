/* eslint-disable*/
import axios from 'axios';

export const startChat = async () => {
  await axios({
    method: 'GET',
    url: '/api/v1/chat/start-chat',
  });
};
