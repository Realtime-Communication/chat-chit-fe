export const insertMessage = (msg, id) => {
    const item = document.createElement('div');
    item.class= "message-can-dalete";
    const tab = 
    `<div class=${msg.from_id === id ? "message-right" : "message-left"}>
        <div class="message-wrap">
            <div class="user-coming">${msg.from_id === id ? msg.from  + ' [Me] ': msg.from}</div>
            <div class="user-content"><i class="message-content">${haveLink(msg.content)}</i></div>
        </div>
    </div>`
    item.innerHTML = tab;
    return item;
}

function haveLink(content) {
    const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'svg'];
    const miniText = content.split(' ');
    const isLinks = miniText.map((item) => {
        if (imageExtensions.some(ext => item.endsWith('.' + ext)) || item.startsWith("data:image")) return `<img src=${item}>`;
        else return item;
    })
    const result = isLinks.join(' ');
    return result;
}