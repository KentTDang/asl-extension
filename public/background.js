chrome.sidePanel
  .setPanelBehavior({ openPanelOnActionClick: true })
  .catch((error) => console.error(error));

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  try {
    if (request.action === "currentCaption") {
      // Handle current caption
      console.log("Received current caption:", request.text);
      chrome.runtime.sendMessage({action: 'captionUpdate', text: request.text});
      sendResponse({received: true});
    }
  } catch (error) {
    console.error("Error processing message:", error);
    sendResponse({error: error.message});
  }
  // Return true to indicate that we will send a response asynchronously
  return true;
});