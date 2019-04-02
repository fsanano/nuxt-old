/* eslint-disable */
import Echo from 'laravel-echo';
import io from 'socket.io-client';

const token = process.env.LARAVEL_ECHO_TOKEN;
const echo = new Echo({
  client: io,
  broadcaster: 'socket.io',
  host: process.env.WS_URL,
  auth: {
    header: {
      Authorization: `Bearer ${token}`,
    },
  },
});


export default echo;
