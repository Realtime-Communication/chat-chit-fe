import React, { useState } from "react";
import Picker, { Theme, EmojiStyle } from "emoji-picker-react";
type EmojiObject = { emoji: string };

export default function Emoji(props: { value: any; }) {
  const [chosenEmoji, setChosenEmoji] = useState<EmojiObject | null>(null);
  const inputRef = props.value;

  const onEmojiClick = (emojiData: { emoji: any; }, emojiObject: any) => {
    setChosenEmoji(emojiObject || emojiData);
    if (inputRef.current) {
      inputRef.current.value = inputRef.current.value + `${emojiData.emoji} `;
      inputRef.current.focus();
    }
  };

  return (
    <div className="z-50">
      <div className="bg-white border border-gray-200 rounded-xl shadow-lg p-2 w-72 sm:w-80">
        <div className="mb-2 flex items-center gap-2">
          {chosenEmoji ? (
            <span className="flex items-center gap-1 text-sm text-[#0088cc]">
              <span>Your Emoji:</span>
              <span style={{ fontSize: "1.2rem" }}>{chosenEmoji.emoji}</span>
            </span>
          ) : (
            <span className="text-xs text-gray-400">Pick an emoji</span>
          )}
        </div>
        <Picker
          onEmojiClick={onEmojiClick}
          width="100%"
          height={350}
          theme={Theme.LIGHT}
          searchDisabled={false}
          skinTonesDisabled={false}
          emojiStyle={EmojiStyle.NATIVE}
        />
      </div>
    </div>
  );
}
