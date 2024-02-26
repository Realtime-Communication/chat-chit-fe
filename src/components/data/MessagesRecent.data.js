import { token } from "../store/tokenContext";

export const MessagesRecent = (toId) => {
    fetch(`${process.env.REACT_APP_API}/chats/with-id/${toId}`, {
        method: 'GET',
        headers: {
            Authorization: `Bearer ${token}`,
        }
    })
    .then(res => res.json())
    .then(data => {
        console.log(data.data);
        return data.data;
    })
    .catch(err => err);
}