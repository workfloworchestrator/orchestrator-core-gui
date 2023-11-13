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
const pingintervalInMilliseconds = 30000;

const websocketSettings: Options = {
    retryOnError: true,
    reconnectAttempts: 10,
    reconnectInterval: 10000,
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
        let pingInterval: NodeJS.Timeout | undefined = undefined;

        if (readyState === ReadyState.OPEN) {
            pingInterval = setInterval(() => sendMessage(pingMessage), pingintervalInMilliseconds);
        } else {
            pingInterval && clearInterval(pingInterval);
            pingInterval = undefined;
        }

        return () => pingInterval && clearInterval(pingInterval);
    }, [sendMessage, readyState]);

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
        setUsefallback(readyState === ReadyState.CLOSED);
    }, [readyState]);

    useEffect(() => {
        let pingInterval: NodeJS.Timeout | undefined = undefined;

        if (readyState === ReadyState.OPEN) {
            pingInterval = setInterval(() => sendMessage(pingMessage), pingintervalInMilliseconds);
        } else {
            pingInterval && clearInterval(pingInterval);
            pingInterval = undefined;
        }

        return () => pingInterval && clearInterval(pingInterval);
    }, [sendMessage, readyState]);

    useEffect(() => {
        if (lastMessage && lastMessage.data === "__pong__") {
            // handle pong...
        }
    }, [lastMessage]);

    return { lastMessage: lastJsonMessage, readyState, useFallback };
};

const useWebsocketService = ENV.OAUTH2_ENABLED ? useWebsocketServiceWithAuth : useWebsocketServiceWithoutAuth;

export default useWebsocketService;
