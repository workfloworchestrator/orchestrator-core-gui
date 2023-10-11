import { useAuth } from "oidc-react";
import { useEffect, useState } from "react";
import useWebSocket, { Options, ReadyState } from "react-use-websocket";

import { ENV } from "../env";

const isSecure = !!ENV.BACKEND_URL.includes("https");
const wsProtocol = isSecure ? "wss" : "ws";
const websocketUrl = `${wsProtocol}${ENV.BACKEND_URL.replace(/(^\w+|^)/, "")}`;

export interface SurfWebSocket<T> {
    lastMessage: T | null;
    readyState: ReadyState;
    useFallback: boolean;
}

const pingMessage = "__ping__";

const websocketSettings: Options = {
    retryOnError: true,
    reconnectAttempts: 10,
    reconnectInterval: 3000,
    shouldReconnect: (closeEvent: any) => {
        console.log(closeEvent);
        return true;
    },
    share: true,
};

const useWebsocketServiceWithAuth = <T extends object>(endpoint: string): SurfWebSocket<T> => {
    const auth = useAuth();
    const baseUrl = `${websocketUrl}/${endpoint}?token=`;
    const [url, setUrl] = useState<string>("");

    const { lastJsonMessage, readyState, sendMessage, lastMessage } = useWebSocket(url, websocketSettings, !!url);
    const [useFallback, setUsefallback] = useState<boolean>(false);

    useEffect(() => {
        setUsefallback(readyState === ReadyState.CLOSED);
    }, [readyState]);

    useEffect(() => {
        setUrl(`${baseUrl}${auth.userData?.access_token}`);
    }, [baseUrl, auth.userData?.access_token]);

    useEffect(() => {
        const pingInterval = setInterval(() => sendMessage(pingMessage), ENV.WS_PING_INTERVAL_IN_SECONDS);
        return () => clearInterval(pingInterval);
    }, [sendMessage]);

    useEffect(() => {
        if (lastMessage && lastMessage.data === "__pong__") {
            // handle pong...
        }
    }, [lastMessage]);

    return { lastMessage: lastJsonMessage, readyState, useFallback };
};

const useWebsocketServiceWithoutAuth = <T extends object>(endpoint: string): SurfWebSocket<T> => {
    const baseUrl = `${websocketUrl}/${endpoint}?token=`;
    const { lastJsonMessage, readyState, sendMessage, lastMessage } = useWebSocket(baseUrl, websocketSettings);
    const [useFallback, setUsefallback] = useState<boolean>(false);

    useEffect(() => {
        if (readyState === ReadyState.CLOSED) {
            setUsefallback(true);
        } else {
            setUsefallback(false);
        }
    }, [readyState]);

    useEffect(() => {
        const pingInterval = setInterval(() => sendMessage(pingMessage), ENV.WS_PING_INTERVAL_IN_SECONDS);
        return () => clearInterval(pingInterval);
    }, [sendMessage]);

    useEffect(() => {
        if (lastMessage && lastMessage.data === "__pong__") {
            // handle pong...
        }
    }, [lastMessage]);

    return { lastMessage: lastJsonMessage, readyState, useFallback };
};

const useWebsocketService = ENV.OAUTH2_ENABLED ? useWebsocketServiceWithAuth : useWebsocketServiceWithoutAuth;

export default useWebsocketService;
