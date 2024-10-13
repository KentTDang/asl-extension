import React, { useState, useEffect, useCallback } from 'react';

export default function SidePanel() {
  const [audioLevel, setAudioLevel] = useState(0);
  const [caption, setCaption] = useState('');

  const handleMessage = useCallback((request) => {
    if (request.action === "audioUpdate") {
      setAudioLevel(request.data);
    }
    if(request.action === "captionUpdate") {
      setCaption(request.text);
    }
  }, []);

  useEffect(() => {
    chrome.runtime.onMessage.addListener(handleMessage);
    return () => chrome.runtime.onMessage.removeListener(handleMessage);
  }, [handleMessage]);

  return (
    <div>
      <h1>YouTube Video Info</h1>
      <p>Current Audio Level: {audioLevel.toFixed(2)}</p>
      <p>Current Caption: {caption}</p>
    </div>
  );
}