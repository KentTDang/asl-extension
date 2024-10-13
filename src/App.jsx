import React, { useEffect, useState } from "react";
import { createUseStyles } from "react-jss";
import OpenAI from "openai";
import SidePanel from "./components/SidePanel";
import Hero from "./components/Hero";

// Application Styling
const styles = {
  container: {
    background: "gray",
  },
};
const useStyles = createUseStyles(styles);

// OpenAI API Key
const openai = new OpenAI({
  apiKey: process.env.REACT_APP_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true,
});

export default function App() {
  const styles = useStyles();
  const [resposne, setResponse] = useState("");

  useEffect(() => {
    const fetchResponse = async () => {
      try {
        const completion = await openai.chat.completions.create({
          model: "gpt-3.5-turbo",
          messages: [
            { role: "system", content: "You are a helpful assistant." },
            {
              role: "user",
              content: "Write a haiku about recursion in programming.",
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

    fetchResponse();
  }, []);

  return (
    <>
      <Hero />
      <SidePanel />
      <div className={styles.container}>{resposne}</div>
      
    </>
  );
}
