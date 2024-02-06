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
    return null;
}
const token = getCookie('access_token');
const { username, sub } = jwtDecode(token);

const socket = io("http://localhost:8000/", {
    autoConnect: true
});
socket.emit("initial", {
    userName: username,
    id: sub
})

export default socket;