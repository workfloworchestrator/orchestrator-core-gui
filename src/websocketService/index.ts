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

import { useAuth } from "oidc-react";
import { useEffect, useState } from "react";
import useWebSocket, { ReadyState } from "react-use-websocket";

import { ENV } from "../env";

const isSecure = !!ENV.BACKEND_URL.includes("https");

const wsProtocol = isSecure ? "wss" : "ws";
const websocketUrl = `${wsProtocol}${ENV.BACKEND_URL.replace(/(^\w+|^)/, "")}`;

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

const useWebsocketServiceWithAuth = (endpoint: string): SurfWebSocket => {
    const auth = useAuth();
    const baseUrl = `${websocketUrl}/${endpoint}?token=`;
    const [url, setUrl] = useState<string>("");

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
        setUrl(`${baseUrl}${auth.userData?.access_token}`);
    }, [baseUrl, auth.userData?.access_token]);

    return { lastMessage, readyState, useFallback };
};

const useWebsocketServiceWithoutAuth = (endpoint: string): SurfWebSocket => {
    const baseUrl = `${websocketUrl}/${endpoint}?token=`;
    const { lastMessage, readyState } = useWebSocket(baseUrl, websocketSettings);
    const [useFallback, setUsefallback] = useState<boolean>(false);

    useEffect(() => {
        if (readyState === ReadyState.CLOSED) {
            setUsefallback(true);
        } else {
            setUsefallback(false);
        }
    }, [readyState]);

    return { lastMessage, readyState, useFallback };
};

const useWebsocketService = ENV.OAUTH2_ENABLED ? useWebsocketServiceWithAuth : useWebsocketServiceWithoutAuth;

export default useWebsocketService;
