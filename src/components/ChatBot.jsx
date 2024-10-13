import React, { useState } from "react";
import OpenAI from "openai"; // Import OpenAI API client
import "./ChatBot.css"; // Custom CSS for styling
import { collection, getDocs } from "firebase/firestore"; // Firestore functions
import { db } from "../firebaseConfig"; // Firebase configuration

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.REACT_APP_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true, // Allow API calls from the browser
});

export default function ChatBot() {
  const [response, setResponse] = useState(""); // Store LLM response
  const [userInput, setUserInput] = useState(""); // Track user input
  const [loading, setLoading] = useState(false); // Track loading state

  // Fetch captions from Firestore and send to OpenAI
  const fetchCaptions = async (e) => {
    e.preventDefault(); // Prevent page reload
    setLoading(true); // Set loading state
    console.log("Fetching captions from Firestore...");

    try {
      // Get all documents from the "captions" collection
      const querySnapshot = await getDocs(collection(db, "captions"));
      const captions = [];

      querySnapshot.forEach((doc) => {
        captions.push(doc.data().caption); // Collect captions into an array
      });

      console.log("Fetched Captions: ", captions);

      if (captions.length === 0) {
        console.warn("No captions found.");
        setResponse("No captions available.");
        return;
      }

      // Send the captions to the OpenAI API
      const completion = await openai.chat.completions.create({
        model: "gpt-4o-mini", // Use the gpt-4o-mini model
        messages: [
          {
            role: "system",
            content:
              "You are a teacher tasked with providing accurate and easy-to-follow notes based on the following lecture transcript.Please respond with plain text only, without Markdown formatting.",
          },
          { role: "user", content: captions.join("\n") }, // Join captions as a single message
        ],
      });

      const messageContent = completion.choices[0].message.content;
      console.log("LLM Response: ", messageContent);
      setResponse(messageContent); // Update response state with the LLM output
    } catch (error) {
      console.error("Error fetching captions: ", error.message);
      setResponse("Failed to generate notes. Please try again.");
    } finally {
      setLoading(false); // Reset loading state
    }
  };

  // Handle user input and send it to OpenAI
  const onSubmit = async (e) => {
    e.preventDefault(); // Prevent page reload
    setLoading(true); // Set loading state

    try {
      const completion = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content:
              "You are a helpful assistant. Please respond with plain text only, without Markdown formatting.",
          },
          { role: "user", content: userInput },
        ],
      });

      const messageContent = completion.choices[0].message.content;
      console.log("LLM Response: ", messageContent);
      setResponse(messageContent); // Update response state
      setUserInput(""); // Clear user input field
    } catch (error) {
      console.error("Error fetching OpenAI response:", error.message);
      setResponse("Failed to fetch response.");
    } finally {
      setLoading(false); // Reset loading state
    }
  };

  return (
    <div className="main">
      <div className="main-container">
        <div>
          <div className="cards">
            {["Help me write", "Surprise me", "Analyze Data", "Solve"].map(
              (prompt) => (
                <button
                  key={prompt}
                  className="card"
                  onClick={() =>
                    onSubmit({
                      preventDefault: () => {},
                      target: { value: prompt },
                    })
                  }
                >
                  <p>{prompt}</p>
                </button>
              )
            )}
          </div>
        </div>

        <div className="main-content">
          <p>{response}</p> {/* Display the LLM response */}
        </div>

        <div className="main-bottom">
          <form onSubmit={onSubmit} className="search-box">
            <input
              type="text"
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)} // Update user input state
              placeholder="Enter a prompt here"
            />
            <div>
              <div className="tools">
                <button
                  type="button"
                  className="notes-btn"
                  onClick={fetchCaptions} // Correct invocation of fetchCaptions
                >
                  Notes
                </button>
                {loading ? (
                  <button type="submit" className="submit-btn" disabled>
                    Loading...
                  </button>
                ) : (
                  <button type="submit" className="submit-btn">
                    Send
                  </button>
                )}
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
