import { jwtDecode } from 'jwt-decode';
import { io } from 'socket.io-client';
import { token } from '../store/tokenContext';

const info = () => {
  try {
    return jwtDecode(token);
  } catch (error) {
    return {};
  }
}

const socketOptions = {
  transportOptions: {
    polling: {
      extraHeaders: {
        Authorization: 'Bearer ' + token, 
      }
    }
  }
};

const { username, sub } = info();

const socket = io(`${process.env.REACT_APP_API.substring(0, process.env.REACT_APP_API.indexOf('/api'))}/`, {
  ...socketOptions,
  query: { myParam: sub },
  autoConnect: true,
});

export default socket;