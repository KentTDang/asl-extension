import React, { useEffect, useState, useCallback } from "react";

export default function ClosedCaption() {
  const [caption, setCaption] = useState("");

  const handleMessage = useCallback((request) => {
    if(request.action === "captionUpdate") {
      setCaption(request.text);
    }
  }, []);

  useEffect(() => {
    chrome.runtime.onMessage.addListener(handleMessage);
    return () => chrome.runtime.onMessage.removeListener(handleMessage);
  }, [handleMessage]);

  return (
    <>
    <p>Hello World</p>
    <p>{caption}</p>
    </>
  )
}
