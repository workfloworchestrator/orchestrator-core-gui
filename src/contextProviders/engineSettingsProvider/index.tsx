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

import { createContext, useCallback, useContext, useEffect, useState } from "react";
import ApplicationContext from "utils/ApplicationContext";
import { EngineStatus } from "utils/types";
import useHttpIntervalFallback from "utils/useHttpIntervalFallback";
import useWebsocket from "websocketService/useWebsocket";

interface WebSocketMessageData {
    "engine-status": EngineStatus;
}

export interface EngineSettingsContextData {
    engineStatus: EngineStatus;
    useFallback: boolean;
}

const defaultEngineSettings: EngineStatus = {
    global_lock: false,
    running_processes: 0,
    global_status: "RUNNING",
};

const EngineSettingsContext = createContext<EngineSettingsContextData>({
    engineStatus: defaultEngineSettings,
    useFallback: false,
});

export const RunningProcessesProvider = EngineSettingsContext.Provider;
export default EngineSettingsContext;

export function EngineSettingsContextWrapper({ children }: any) {
    const { apiClient } = useContext(ApplicationContext);
    const { message, useFallback } = useWebsocket<WebSocketMessageData>("api/settings/ws-status/");
    const [engineStatus, setEngineStatus] = useState<EngineStatus>({
        global_lock: false,
        running_processes: 0,
        global_status: "RUNNING",
    });

    const getEngineStatus = useCallback(() => {
        apiClient.getGlobalStatus().then((newEngineStatus) => {
            setEngineStatus(newEngineStatus);
        });
    }, [setEngineStatus, apiClient]);

    useHttpIntervalFallback(useFallback, getEngineStatus);

    useEffect(() => {
        if (message["engine-status"]) {
            setEngineStatus(message["engine-status"]);
        }
    }, [message]);

    return <RunningProcessesProvider value={{ engineStatus, useFallback }}>{children}</RunningProcessesProvider>;
}
