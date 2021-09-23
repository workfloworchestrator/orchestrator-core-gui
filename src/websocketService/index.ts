import { ENV } from "../env";
import * as WebSocketCodes from "./codes";

const websocketUrl = `wss${ENV.BACKEND_URL.replace(/(^\w+|^)/, "")}`;

class WebsocketService {
    token = "test-bla-bla";

    setToken = (token: string | undefined | null) => {
        this.token = token ?? "";
    };

    connect = (url: string): WebSocket => {
        return new WebSocket(`${websocketUrl}/${url}?token=${this.token}`);
    };
}

export const websocketService = new WebsocketService();
export { WebSocketCodes };
