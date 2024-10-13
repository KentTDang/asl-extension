chrome.sidePanel
  .setPanelBehavior({ openPanelOnActionClick: true })
  .catch((error) => console.error(error));

  let captionBuffer = [];

  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    try {
      if (request.action === "audioData") {
        // Handle audio data
        console.log("Received audio data:", request.data);
        sendResponse({received: true});
      } else if (request.action === "newCaption") {
        // Handle new caption
        console.log("Received new caption:", request.text);
        sendResponse({received: true});
        captionBuffer.push(request.text);
        
        // If you want to process captions in chunks:
        if (captionBuffer.length >= 10) {  // Process every 10 captions
          processCaption(captionBuffer.join(' '));
          captionBuffer = [];
        }
      }
    } catch (error) {
      console.error("Error processing message:", error);
      sendResponse({error: error.message});
    }
    // Return true to indicate that we will send a response asynchronously
    return true;
  });
  
  function processCaption(captionText) {
    console.log("Processing caption:", captionText);
    // After processing, send to side panel
    chrome.runtime.sendMessage({action: 'processedCaption', text: captionText});
  }

