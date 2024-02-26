import { token } from "../store/tokenContext";

export const MyGroup = () => {
    fetch(`${process.env.REACT_APP_API}/groups/mygroups`, {
        method: 'GET',
        headers: {
            Authorization: `Bearer ${token}`,
        }
    })
    .then(res => res.json())
    .then(data => {
        return data.data.map(item => item._id);
    })
    .catch(err => {
        return err;
    });
}