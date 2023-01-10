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

import useWebsocket from "../useWebsocket";

export interface FailedProcess {
    pid: string;
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
    const { message, useFallback } = useWebsocket<WebSocketMessageData>("api/processes/all/");
    const [runningProcesses, setRunningProcesses] = useState<WsProcessV2[]>([]);
    const [completedProcessIds, setCompletedProcessIds] = useState<string[]>([]);

    const handleProcessUpdate = ({ process }: WebSocketMessageData) => {
        if (!process) {
            return;
        }

        setRunningProcesses([...runningProcesses.filter((p) => p.pid !== process.id), process]);

        if (process.status === ProcessStatus.COMPLETED || process.status === ProcessStatus.ABORTED) {
            setTimeout(() => setRunningProcesses(runningProcesses.filter((p) => p.pid !== process.id)), 100);
            setCompletedProcessIds([...completedProcessIds, process.id]);
        }
    };

    useEffect(() => {
        handleProcessUpdate(message);
    }, [message]); // eslint-disable-line react-hooks/exhaustive-deps

    return { runningProcesses, completedProcessIds, useFallback };
};

export default useRunningProcesses;
