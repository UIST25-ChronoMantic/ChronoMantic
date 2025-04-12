import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import store from "./app/store";
import { Provider } from "react-redux";
import { ConfigProvider } from "antd";

createRoot(document.getElementById("root")!).render(
	<StrictMode>
		<ConfigProvider
			theme={{
				token: {
					colorPrimary: "#0E3F78"
				},
			}}
		>
			<Provider store={store}>
				<App />
			</Provider>
		</ConfigProvider>
	</StrictMode>
);
