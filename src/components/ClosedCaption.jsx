import React, { useEffect, useState, useCallback, useRef } from "react";
import { createUseStyles } from "react-jss";
import { signDictionary } from "../util/signDictionary";

export default function ClosedCaption() {
  const [caption, setCaption] = useState("");
  const [aslTranslation, setAslTranslation] = useState([]);
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
  const videoRefs = useRef([]);
  const styles = useStyles();

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
    const aslTranslation = [];
    let hasUnknownWords = false;
  
    words.forEach((word) => {
      if (word in signDictionary) {
        aslTranslation.push({
          word: word,
          asset: chrome.runtime.getURL(signDictionary[word]),
        });
      } else {
        hasUnknownWords = true;
      }
    });
  
    if (hasUnknownWords) {
      aslTranslation.push({ word: 'unknown', asset: null });
    }
  
    return aslTranslation;
  }

  useEffect(() => {
    if (
      aslTranslation.length > 0 &&
      currentVideoIndex < aslTranslation.length
    ) {
      const currentVideo = videoRefs.current[currentVideoIndex];
      if (currentVideo) {
        currentVideo.play();
        currentVideo.onended = () => {
          setCurrentVideoIndex((prevIndex) => prevIndex + 1);
        };
      } else {
        setCurrentVideoIndex((prevIndex) => prevIndex + 1);
      }
    } else if (currentVideoIndex >= aslTranslation.length) {
      setCurrentVideoIndex(0);
    }
  }, [aslTranslation, currentVideoIndex]);

  return (
    <>
      <div className={styles.container}>
        <span className={styles.header}>Translation</span>
        {caption.length === 0 ? (
          <img src="/assets/Thumbnail.png" alt="" className={styles.imgContainer}/>
        ) : (
          aslTranslation.map((item, index) => (
            <span key={index}>
              {item.asset ? (
                <video
                  ref={(el) => (videoRefs.current[index] = el)}
                  src={item.asset}
                  alt={item.word}
                  className={styles.imgContainer}
                  muted
                />
              ) : (
                <img src="/assets/Thumbnail.png" alt="" className={styles.imgContainer}/>
              )}
            </span>
          ))
        )}

        <div className={styles.captionContainer}>
          <p className={styles.caption}>{caption}</p>
        </div>
      </div>
    </>
  );
}

const styles = {
  container: {
    background: "#fff",
    fontFamily: " 'Poppins', sans-serif",
    borderBottom: "2px solid #e5e5e5",
  },
  captionContainer: {
    width: 350,
    height: 350,
    fontFamily: " 'Poppins', sans-serif",
  },
  header: {
    fontSize: "18px",
    fontWeight: 400,
    padding: "6px",
    color: "#343a40",
  },
  caption: {
    fontSize: "16px",
    fontWeight: 400,
  },
  imgContainer: {
    width: '100%', 
    maxHeight: '300px',
    objectFit: 'contain',
  },
  gradient: {
    background: "linear-gradient(to right, #0BA8FF, #C687FF)",
  },
};
const useStyles = createUseStyles(styles);
