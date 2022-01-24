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
    const pingTimeout = useRef<NodeJS.Timeout | undefined>(undefined);
    const [message, setMessage] = useState<T>({} as T);
    const [useFallback, setUsefallback] = useState<boolean>(false);

    const ping = () => {
        if (!client.current) return;
        client.current.send('__ping__');
        pingTimeout.current = setTimeout(disconnectWebsocket, 5000);
    }

    function pong() {
        pingTimeout.current && clearTimeout(pingTimeout.current);
        pingTimeout.current = undefined;
        setTimeout(() => ping, 30000);
    }

    const connectWebsocket = () => {
        disconnectWebsocket();

        if (!client.current) {
            const newClient = websocketService.connect(endpoint);
            newClient.onopen = () => {
                setUsefallback(false);
                ping();
            };
            newClient.onmessage = ({ data }) => {
                if (data === '__pong__') {
                    return pong();
                }
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
            clearTimeout(timeout.current);
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
