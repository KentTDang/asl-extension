import React, { useState, useEffect } from 'react';

export default function SidePanel() {
  const [audioLevel, setAudioLevel] = useState(0);

  useEffect(() => {
    chrome.runtime.onMessage.addListener((request) => {
      if (request.action === "audioData") {
        setAudioLevel(request.data);
      }
    });
  }, []);

  return (
    <div>
      <h1>YouTube Video Info</h1>
      <p>Current Audio Level: {audioLevel.toFixed(2)}</p>
    </div>
  );
}