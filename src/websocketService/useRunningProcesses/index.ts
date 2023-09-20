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
import { ProcessStatus, Step, WsProcessV2 } from "utils/types";
import useWebsocketService from "websocketService";

export interface FailedProcess {
    process_id: string;
    last_status: string;
}

export interface WebSocketMessageData {
    failedProcesses?: FailedProcess[];
    process?: WsProcessV2;
    step?: Step;
}

export interface RunningProcesses {
    runningProcesses: WsProcessV2[];
    completedProcessIds: string[];
    useFallback: boolean;
}

const useRunningProcesses = (): RunningProcesses => {
    const { lastMessage, useFallback } = useWebsocketService("api/processes/all/");
    const [runningProcesses, setRunningProcesses] = useState<WsProcessV2[]>([]);
    const [completedProcessIds, setCompletedProcessIds] = useState<string[]>([]);

    const handleProcessUpdate = ({ process }: WebSocketMessageData) => {
        if (!process) {
            return;
        }

        setRunningProcesses([...runningProcesses.filter((p) => p.process_id !== process.id), process]);

        if (process.last_status === ProcessStatus.COMPLETED || process.last_status === ProcessStatus.ABORTED) {
            setTimeout(() => setRunningProcesses(runningProcesses.filter((p) => p.process_id !== process.id)), 100);
            setCompletedProcessIds([...completedProcessIds, process.id]);
        }
    };

    useEffect(() => {
        if (lastMessage) {
            handleProcessUpdate(lastMessage);
        }
    }, [lastMessage]); // eslint-disable-line react-hooks/exhaustive-deps

    return { runningProcesses, completedProcessIds, useFallback };
};

export default useRunningProcesses;
