import { ENV } from "../env";

const isSecure = !!ENV.BACKEND_URL.includes("https");

const wsProtocol = isSecure ? "wss" : "ws";
export const websocketUrl = `${wsProtocol}${ENV.BACKEND_URL.replace(/(^\w+|^)/, "")}`;

export const websocketSettings = {
    retryOnError: true,
    reconnectAttempts: 10,
    reconnectInterval: 3000,
    share: true,
};
