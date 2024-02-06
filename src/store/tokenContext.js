import { createContext } from "react";

export const TokenContext = createContext({
})
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
const TokenContextProvider = ({children}) => {
    
    const token = getCookie('access_token');

    return ( 
        <TokenContext.Provider value={{token: token}}>
            {children}
        </TokenContext.Provider>
    )
}

export default TokenContextProvider;