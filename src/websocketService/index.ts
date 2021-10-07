import { ENV } from "../env";
import * as WebSocketCodes from "./codes";

const wsProtocol = ENV.ENVIRONMENT === 'local' ? 'ws' : 'wss';
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

export const websocketReconnectTime = 28800;
export const websocketService = new WebsocketService();
export { WebSocketCodes };
