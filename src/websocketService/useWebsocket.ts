/*
 * Copyright 2019-2020 SURF.
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

import { useEffect, useRef, useState } from "react";
import { WebSocketCodes, websocketReconnectTime, websocketService } from "websocketService";

const useWebsocket = <T extends object>(
    endpoint: string
): {
    message: T;
    useFallback: boolean;
    getWebsocket: () => WebSocket | undefined;
} => {
    const client = useRef<WebSocket | undefined>(undefined);
    const timeout = useRef<NodeJS.Timeout | undefined>(undefined);
    const [message, setMessage] = useState<T>({} as T);
    const [useFallback, setUsefallback] = useState<boolean>(false);

    const connectWebsocket = () => {
        disconnectWebsocket();

        if (!client.current) {
            const newClient = websocketService.connect(endpoint);
            newClient.onopen = () => {
                setUsefallback(false);
            };
            newClient.onmessage = ({ data }) => {
                setMessage(JSON.parse(data));
            };
            newClient.onerror = () => {
                setUsefallback(true);
            };
            newClient.close = () => {
                setUsefallback(true);
            };
            client.current = newClient;
        }

        // wait max 3 seconds on timeout: so non working websocket will take 3 seconds to load old process page
        setTimeout(() => {
            if (client.current?.readyState !== 1) {
                disconnectWebsocket();
                setUsefallback(true);
            }
        }, 3000);

        // timeout to reconnect to enforce re-auth.
        timeout.current = setTimeout(() => {
            connectWebsocket();
        }, websocketReconnectTime);
    };

    const disconnectWebsocket = () => {
        if (client.current) {
            client.current.close(WebSocketCodes.NORMAL_CLOSURE);
        }
        if (timeout.current) {
            clearInterval(timeout.current);
            timeout.current = undefined;
        }
    };

    const getWebsocket = (): WebSocket | undefined => {
        return client.current;
    };

    useEffect(() => {
        connectWebsocket();
        return () => disconnectWebsocket();
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    return { message, useFallback, getWebsocket };
};

export default useWebsocket;
