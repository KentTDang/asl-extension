import React, {useState} from "react";
import OpenAI from "openai";
import "./ChatBot.css";

const openai = new OpenAI({
  apiKey: process.env.REACT_APP_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true,
});

export default function ChatBot() {
    const [response, setResponse] = useState("");
    const [userInput, setUserInput] = useState("");

    const onSubmit = async (e) => {
      e.preventDefault();
      try {
        const completion = await openai.chat.completions.create({
          model: "gpt-3.5-turbo",
          messages: [
            { role: "system", content: "You are a helpful assistant." },
            {
              role: "user",
              content: userInput,
            },
          ],
        });

        const messageContent = completion.choices[0].message.content;
        setResponse(messageContent);
      } catch (e) {
        console.error("Error fetching OpenAI response:", e);
        setResponse("Failed to fetch response.");
      }
    };

  return (
    <div className="main">
      <div className="main-container">
        <div>
          <div className="cards">
            <button className="card" onClick={() => onSubmit(setUserInput("Suggest beautiful places to see on an upcoming road trip"))}>
              <p>Help me write</p>
            </button>
            <button className="card" onClick={() => onSubmit(setUserInput("Suggest beautiful places to see on an upcoming road trip"))}>
              <p>Surprise me</p>
            </button>
            <button className="card" onClick={() => onSubmit(setUserInput("Suggest beautiful places to see on an upcoming road trip"))}>
              <p>Analyze Data</p>
            </button>
            <button className="card" onClick={() => onSubmit(setUserInput("Suggest beautiful places to see on an upcoming road trip"))}>
              <p>Solve</p>
            </button>
          </div>
        </div>

        <div className="main-content">
              <p>{response}</p>
            </div>

        

        <div className="main-bottom">
          <form onSubmit={onSubmit} className="search-box">
            <input
              type="text"
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              placeholder="Enter a prompt here"
            />
            <div>
              <button
                type="submit"
                className="submit-btn"
              ></button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
