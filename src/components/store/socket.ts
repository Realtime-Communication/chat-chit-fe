import { jwtDecode } from "jwt-decode";
import { io } from "socket.io-client";
import { token } from "./tokenContext";

const useSocket: any = io(process.env.REACT_APP_API || '', {
  auth: { token },
  transportOptions: {
    polling: {
      extraHeaders: {
        Authorization: `Bearer ${token}`,
      },
    },
  },
  autoConnect: true,
});

export default useSocket;
