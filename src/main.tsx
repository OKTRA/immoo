import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
// Import the dev tools and initialize them
import { TempoDevtools } from "tempo-devtools";
import { replaceCurrentFavicon } from "./utils/replaceFavicon";
// Import i18n configuration
import "./i18n";

TempoDevtools.init();

// Appliquer le favicon IMMOO
replaceCurrentFavicon();

createRoot(document.getElementById("root")!).render(<App />);
