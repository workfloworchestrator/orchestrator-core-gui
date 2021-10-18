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

import { useEffect, useState } from "react";
import { Process, ProcessStatus, Step } from "utils/types";

import useWebsocket from "../useWebsocket";

export interface RunningProcess extends Process {
    id: string;
    status: ProcessStatus;
}

export interface FailedProcess {
    pid: string;
    last_status: string;
}

export interface WebSocketMessageData {
    failedProcesses?: FailedProcess[];
    process?: RunningProcess;
    step?: Step;
}

export interface RunningProcesses {
    runningProcesses: RunningProcess[];
}

const useRunningProcesses = (): RunningProcesses => {
    const [data] = useWebsocket<WebSocketMessageData>("api/processes/all/");
    const [runningProcesses, setRunningProcesses] = useState<RunningProcess[]>([]);

    const handleProcessUpdate = ({ process }: WebSocketMessageData) => {
        if (!process) {
            return;
        }

        if (process.status === ProcessStatus.COMPLETED ||  process.status === ProcessStatus.ABORTED) {
            setRunningProcesses(runningProcesses.filter((p) => p.pid !== process.id));
        } else {
            setRunningProcesses([
                ...runningProcesses.filter((p) => p.pid !== process.id),
                {
                    ...process,
                    pid: process.id,
                    last_status: process.status,
                },
            ]);
        }
    };

    useEffect(() => {
        if (data.failedProcesses) {
            setRunningProcesses(data.failedProcesses as RunningProcess[]);
        }

        handleProcessUpdate(data);
    }, [data]); // eslint-disable-line react-hooks/exhaustive-deps

    return { runningProcesses };
};

export default useRunningProcesses;
