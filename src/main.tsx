import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

// Set favicon to the Naz Favicon PNG in src/assets. Vite will resolve the import to a URL.
import nazFavicon from "./assets/NAZ FAVICON.png";

function setFavicon(href: string) {
	let link = document.querySelector("link[rel~='icon']") as HTMLLinkElement | null;
	if (!link) {
		link = document.createElement('link');
		link.rel = 'icon';
		document.head.appendChild(link);
	}
	link.href = href;
}

setFavicon(nazFavicon);

createRoot(document.getElementById("root")!).render(<App />);
