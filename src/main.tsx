import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
// Import the dev tools and initialize them
import { TempoDevtools } from "tempo-devtools";
TempoDevtools.init();

createRoot(document.getElementById("root")!).render(<App />);
