console.log("Content script loaded");

let videoElement = null;
let captionsEnabled = false;

function findYoutubeVideo() {
  console.log("Searching for YouTube video");
  videoElement = document.querySelector("video.html5-main-video");
  if (videoElement) {
    console.log("Youtube video found:", videoElement);
    setupAudioCapture(videoElement);
    listenForCaptionToggle();
  } else {
    console.log("Youtube video not found");
  }
}

function setupAudioCapture(videoElement) {
  const audioContext = new (window.AudioContext || window.webkitAudioContext)();
  const sourceNode = audioContext.createMediaElementSource(videoElement);
  const analyserNode = audioContext.createAnalyser();

  sourceNode.connect(analyserNode);
  analyserNode.connect(audioContext.destination);

  analyserNode.fftSize = 2048;
  const bufferLength = analyserNode.frequencyBinCount;
  const dataArray = new Uint8Array(bufferLength);

  function getAudioData() {
    analyserNode.getByteFrequencyData(dataArray);
    const average = dataArray.reduce((a, b) => a + b) / bufferLength;
    return average;
  }

  let intervalId = setInterval(() => {
    const audioLevel = getAudioData();
    chrome.runtime.sendMessage({ action: "audioData", data: audioLevel }, (response) => {
      if (chrome.runtime.lastError) {
        console.log("Failed to send message:", chrome.runtime.lastError.message);
        if (chrome.runtime.lastError.message.includes("message port closed")) {
          clearInterval(intervalId);
          console.log("Stopped audio capture due to closed message port");
        }
      }
    });
  }, 100);

  videoElement.audioIntervalId = intervalId;
}

function listenForCaptionToggle() {
  console.log('Setting up caption toggle listener');

  function checkForCaptionButton() {
    const captionButton = document.querySelector('.ytp-subtitles-button');
    if (captionButton) {
      console.log('Caption button found, adding click listener');
      captionButton.addEventListener('click', handleCaptionToggle);
    } else {
      console.log('Caption button not found, will check again');
      setTimeout(checkForCaptionButton, 1000);
    }
  }

  function handleCaptionToggle() {
    captionsEnabled = !captionsEnabled;
    console.log('Captions toggled:', captionsEnabled ? 'enabled' : 'disabled');
    if (captionsEnabled) {
      setupCaptionCapture();
    }
  }

  checkForCaptionButton();
}

function setupCaptionCapture() {
  if (!captionsEnabled) {
    console.log('Captions are not enabled, skipping capture setup');
    return;
  }

  console.log('Setting up caption capture');

  function setupObserver(captionsContainer) {
    console.log('Captions container found, setting up observer');
    const observer = new MutationObserver(() => {
      const captionText = captionsContainer.textContent.trim();
      if (captionText) {
        console.log('Caption:', captionText);
        chrome.runtime.sendMessage({action: 'currentCaption', text: captionText}, (response) => {
          if (chrome.runtime.lastError) {
            console.log("Failed to send caption:", chrome.runtime.lastError.message);
            if (chrome.runtime.lastError.message.includes("message port closed")) {
              observer.disconnect();
              console.log("Stopped caption capture due to closed message port");
            }
          }
        });
      }
    });

    observer.observe(captionsContainer, {
      childList: true,
      subtree: true,
      characterData: true
    });
  }

  function checkForCaptionsContainer() {
    const captionsContainer = document.querySelector('.ytp-caption-window-container');
    if(captionsContainer) {
      setupObserver(captionsContainer);
    } else {
      console.log('Captions container not found, will check again');
      setTimeout(checkForCaptionsContainer, 1000);
    }
  }

  checkForCaptionsContainer();
}

if (!videoElement) {
  const observer = new MutationObserver((mutations) => {
    if (!videoElement) {
      findYoutubeVideo();
    }
    if (videoElement) {
      observer.disconnect();
    }
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true,
  });
}

findYoutubeVideo();
console.log("findYoutubeVideo called");

chrome.runtime.onConnect.addListener(function(port) {
  if (port.name === "contentScript") {
    port.onDisconnect.addListener(function() {
      console.log("Content script disconnected, cleaning up...");
      if (videoElement && videoElement.audioIntervalId) {
        clearInterval(videoElement.audioIntervalId);
      }
    });
  }
});

chrome.runtime.connect({name: "contentScript"});
