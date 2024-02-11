import { jwtDecode } from 'jwt-decode';
import { io } from 'socket.io-client';

const getCookie = (cookieName) => {
    const cookies = document.cookie.split(';');
    for (let i = 0; i < cookies.length; i++) {
      const cookie = cookies[i].trim();
      if (cookie.startsWith(cookieName + '=')) {
        return cookie.substring(cookieName.length + 1);
      }
    }
    return '';
}
const token = getCookie('access_token');

const info = () => {
  try {
      return jwtDecode(token);
  } catch (error) {
      return {};
  }
}
const { username, sub } = info();

const socket = io(`${process.env.REACT_APP_API}/`, {
  query: { myParam: sub },
  autoConnect: true
});

export default socket;