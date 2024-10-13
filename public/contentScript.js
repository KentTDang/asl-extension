/**
 * The purpose of this file is to grab the video and closed-caption elements of youtube
 * and display the contents in the side-panel
 */

let videoElement = null; // Video Element
let captionsEnabled = false; // Close-Caption Toggler

/**
 * This function grabs the video container on youtube and calls the closed-caption
 * toggler function
 */
function findYoutubeVideo() {
  videoElement = document.querySelector("video.html5-main-video");
  if (videoElement) {
    console.log("Youtube video found:", videoElement);
    listenForCaptionToggle();
  } else {
    console.log("Youtube video not found");
  }
}

/** This function listens to the closed-caption button and generates the captions on the
 * side panel
 */
function listenForCaptionToggle() {

  /** Query for the closed-caption button, currently checks for it in intervals due to the nature
   *  of it being turned off upon launch
   *  TODO: Optimize qeury for closed-caption button
   */
  function checkForCaptionButton() {
    const captionButton = document.querySelector(".ytp-subtitles-button");
    if (captionButton) {
      console.log("Caption button found, adding click listener");
      captionButton.addEventListener("click", handleCaptionToggle);
    } else {
      console.log("Caption button not found, will check again");
      setTimeout(checkForCaptionButton, 1000);
    }
  }

  // Calls the setupCaptionsCapture if the closed-caption button is toggled on
  function handleCaptionToggle() {
    captionsEnabled = !captionsEnabled;
    console.log("Captions toggled:", captionsEnabled ? "enabled" : "disabled");
    if (captionsEnabled) {
      setupCaptionCapture();
    }
  }

  checkForCaptionButton();
}

/** 
 * This function captures the closed-captions
*/
function setupCaptionCapture() {
  if (!captionsEnabled) {
    console.log("Captions are not enabled, skipping capture setup");
    return;
  }

  // Sends the captions to the background.js
  function setupObserver(captionsContainer) {
    console.log("Captions container found, setting up observer");
    const observer = new MutationObserver(() => {
      const captionText = captionsContainer.textContent.trim();
      if (captionText) {
        console.log("Caption:", captionText);
        chrome.runtime.sendMessage(
          { action: "currentCaption", text: captionText },
          (response) => {
            if (chrome.runtime.lastError) {
              console.log(
                "Failed to send caption:",
                chrome.runtime.lastError.message
              );
              if (
                chrome.runtime.lastError.message.includes("message port closed")
              ) {
                observer.disconnect();
                console.log(
                  "Stopped caption capture due to closed message port"
                );
              }
            }
          }
        );
      }
    });

    observer.observe(captionsContainer, {
      childList: true,
      subtree: true,
      characterData: true,
    });
  }

  // Chekcs to see if the caption widnow container is there
  function checkForCaptionsContainer() {
    const captionsContainer = document.querySelector(
      ".ytp-caption-window-container"
    );
    if (captionsContainer) {
      setupObserver(captionsContainer);
    } else {
      console.log("Captions container not found, will check again");
      setTimeout(checkForCaptionsContainer, 1000);
    }
  }

  checkForCaptionsContainer();
}

// Finds the video element 
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

// Destructor for content listener
chrome.runtime.onConnect.addListener(function (port) {
  if (port.name === "contentScript") {
    port.onDisconnect.addListener(function () {
      console.log("Content script disconnected, cleaning up...");
      if (videoElement && videoElement.audioIntervalId) {
        clearInterval(videoElement.audioIntervalId);
      }
    });
  }
});

chrome.runtime.connect({ name: "contentScript" });
