/*
 * Copyright 2019-2023 SURF.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *         http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 */

import { useEffect, useState } from "react";
import useWebSocket, { ReadyState } from "react-use-websocket";

import { ENV } from "../env";

const isSecure = !!ENV.BACKEND_URL.includes("https");

const wsProtocol = isSecure ? "wss" : "ws";
const websocketUrl = `${wsProtocol}${ENV.BACKEND_URL.replace(/(^\w+|^)/, "")}`;

class WebsocketToken {
    token = "";

    setToken = (token: string | undefined | null) => {
        this.token = token ?? "";
    };
}
export const websocketToken = new WebsocketToken();

export interface SurfWebSocket {
    lastMessage: MessageEvent<any> | null;
    readyState: ReadyState;
    useFallback: boolean;
}

const websocketSettings = {
    retryOnError: true,
    reconnectAttempts: 10,
    reconnectInterval: 3000,
    share: true,
};

const useWebsocketService = (endpoint: string): SurfWebSocket => {
    const baseUrl = `${websocketUrl}/${endpoint}?token=`;
    const [url, setUrl] = useState<string>(!ENV.OAUTH2_ENABLED ? baseUrl : "");

    const { lastMessage, readyState } = useWebSocket(url, websocketSettings, !!url);
    const [useFallback, setUsefallback] = useState<boolean>(false);

    useEffect(() => {
        if (readyState === ReadyState.CLOSED) {
            setUsefallback(true);
        } else {
            setUsefallback(false);
        }
    }, [readyState]);

    useEffect(() => {
        setUrl(`${baseUrl}${websocketToken.token}`);
    }, [baseUrl, websocketToken.token]);

    return { lastMessage, readyState, useFallback };
};

export default useWebsocketService;
