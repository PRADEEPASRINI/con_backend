// index.tsx (or main.tsx, choose one)
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";

document.documentElement.classList.add("dark");  // Enable dark mode globally

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
