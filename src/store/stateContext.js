import { createContext, useState } from "react";

export const StateContext = createContext({
    isLoad: '',
    setIsLoad: () => {},
})


const StateContextProvider = ({children}) => {

    const [isLoad, setIsLoad] = useState('');

    const setIsLoadDefine = (id) => {
        setIsLoad(id);
        console.log(isLoad);
    }
    // vay em Triet out nha, nao can` thi em triet vao oke <3 em Triet tks
    // con gi hong hieu nua hong, Mtr giup cho, alo em <<< OKE dang ngam code
    return ( 
        <StateContext.Provider value={{isLoad, setIsLoad}}>
            {children}
        </StateContext.Provider>
    )
}

export default StateContextProvider;


// file nao wrap dau em Loi, alo 