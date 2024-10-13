import React, { useEffect, useState, useCallback } from "react";
import { signDictionary } from "../util/signDictionary";

export default function ClosedCaption() {
  const [caption, setCaption] = useState("");
  const [aslTranslation, setAslTranslation] = useState([]);

  const handleMessage = useCallback((request) => {
    if (request.action === "captionUpdate") {
      console.log("Closed Caption Request Test: ", request.text);
      setCaption(request.text);
      setAslTranslation(translateToASL(request.text));
      console.log("Hoping this works:", aslTranslation);
    }
  }, []);

  useEffect(() => {
    chrome.runtime.onMessage.addListener(handleMessage);
    return () => chrome.runtime.onMessage.removeListener(handleMessage);
  }, [handleMessage]);

  function translateToASL(text) {
    const words = text.toLowerCase().split(/\s+/);
    return words.map((word) => {
      if (word in signDictionary) {
        return { 
          word: word, 
          asset: chrome.runtime.getURL(signDictionary[word])
        };
      }
      return { word: word, asset: null };
    });
  }

  return (
    <>
      <>
        <p>Caption: {caption}</p>
        <div>
          ASL Translation:
          {aslTranslation.map((item, index) => (
            <span key={index}>
              {item.asset ? (
                <video
                  src={item.asset}
                  alt={item.word}
                  style={{ width: "50px", height: "50px" }}
                  autoPlay
                  loop
                />
              ) : (
                item.word + " "
              )}
            </span>
          ))}
        </div>
      </>
    </>
  );
}
