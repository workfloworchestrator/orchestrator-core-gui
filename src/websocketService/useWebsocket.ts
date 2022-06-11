/*
 * Copyright 2019-2022 SURF.
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
    const closeTimeout = useRef<NodeJS.Timeout | undefined>(undefined);

    const pingTimeout = useRef<NodeJS.Timeout | undefined>(undefined);
    const [message, setMessage] = useState<T>({} as T);
    const [useFallback, setUsefallback] = useState<boolean>(false);

    const ping = () => {
        if (!client.current) return;
        client.current.send("__ping__");
        pingTimeout.current = setTimeout(() => disconnectWebsocket(false), 5000);
        console.log("Ping")
    };

    function pong() {
        pingTimeout.current && clearTimeout(pingTimeout.current);
        pingTimeout.current = undefined;
        setTimeout(ping, 30000);
        console.log("Pong")
    }

    const connectWebsocket = () => {
        disconnectWebsocket();

        if (!client.current) {
            const newClient = websocketService.connect(endpoint);
            client.current = newClient;
            newClient.onopen = () => {
                setUsefallback(false);
                ping();
            };
            newClient.onmessage = ({ data }) => {
                if (data === "__pong__") {
                    return pong();
                }
                setMessage(JSON.parse(data));
            };
            newClient.onerror = () => {
                setUsefallback(true);
            };
            newClient.close = () => {
                // client.current = undefined;
                console.log("Close called this should trigger reconnect")
                client.current = undefined;
                disconnectWebsocket(true);
            };

        }

        closeTimeout.current = setInterval(() => {
            console.log("Checking if connection is still ok")
            if (!client.current) {
                console.log("Re-connecting:")
                connectWebsocket();
                console.log("Reconnected due to unexpected close")
            }
            else {
                console.log("No reconnect needed")
            }
        }, 3000);


        // timeout to reconnect to enforce re-auth.
        timeout.current = setTimeout(() => {
            connectWebsocket();
            console.log("Reconnect due to re-auth")
        }, websocketReconnectTime);

        // Todo: add a timer based function that checks if client.current is undefined : and call reconnect?


    };

    // const reconnectWebsocket = () => {
    //     pingTimeout.current && clearTimeout(pingTimeout.current);
    //     pingTimeout.current = undefined;
    //
    //     console.log("Reconnecting")
    //     connectWebsocket()
    // }


    const disconnectWebsocket = (reconnect=false) => {
        // Todo: investigate if we also need to clear ping timer?
        pingTimeout.current && clearTimeout(pingTimeout.current);
        if (client.current) {
            client.current.close(WebSocketCodes.NORMAL_CLOSURE);
            client.current = undefined;
        }
        if (timeout.current) {
            clearTimeout(timeout.current);
            timeout.current = undefined;
        }
        if (closeTimeout.current) {
            clearTimeout(closeTimeout.current);
            closeTimeout.current = undefined;
        }
        if(reconnect) {
            console.log("Reconnecting")
            connectWebsocket()
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
