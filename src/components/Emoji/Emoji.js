import React, { useState } from "react";
import Picker from "emoji-picker-react";
import "./emoji.scss";
export default function Emoji(props) {
  
  const [chosenEmoji, setChosenEmoji] = useState(null);
  const inputRef = props.value;
  const onEmojiClick = (event, emojiObject) => {
    setChosenEmoji(emojiObject);
    inputRef.current.value = inputRef.current.value + `${event.emoji} `;
  };

  return (
    <div className="emoji">
      <div className="picker">
        {chosenEmoji ? (
          <span>
            Your Emoji:
            <img style={{ width: "15px" }} src={chosenEmoji.target.src} />
          </span>
        ) : (
          <span>No Emoji</span>
        )}
        <Picker onEmojiClick={onEmojiClick} />
      </div>
    </div>
  );
}
