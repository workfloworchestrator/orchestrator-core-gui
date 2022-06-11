import { ENV } from "../env";
import * as WebSocketCodes from "./codes";

const secure = !!ENV.BACKEND_URL.includes("https");

const wsProtocol = secure ? "wss" : "ws";
const websocketUrl = `${wsProtocol}${ENV.BACKEND_URL.replace(/(^\w+|^)/, "")}`;

class WebsocketService {
    token = "";

    setToken = (token: string | undefined | null) => {
        this.token = token ?? "";
    };

    connect = (url: string): WebSocket => {
        return new WebSocket(`${websocketUrl}/${url}?token=${this.token}`);
    };
}

export const websocketReconnectTime = 300000;
export const websocketService = new WebsocketService();
export { WebSocketCodes };
