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

import "./FailedTaskBanner.scss";

import { EuiText, EuiToolTip } from "@elastic/eui";
import RunningProcessesContext from "contextProviders/runningProcessesProvider";
import { groupBy } from "lodash";
import { useCallback, useContext, useEffect, useState } from "react";
import { useHistory } from "react-router";
import { Process, ProcessStatus } from "utils/types";
import useHttpIntervalFallback from "utils/useHttpIntervalFallback";
import { FailedProcess } from "websocketService/useRunningProcesses";

import useFailedTaskFetcher from "./useFailedTaskFetcher";

enum CheckboxStatus {
    "OK" = "ok",
    "FAILED" = "failed",
}
export interface ProcessData extends Process {
    id: string;
    status: ProcessStatus;
}

interface ProcessWithStatus {
    last_status: string;
}

interface CountFailedProcesses {
    failed: number;
    inconsistentData: number;
    apiUnavailable: number;
    all: number;
}

const failedProcessStatuses = ["failed", "api_unavailable", "inconsistent_data"];
const filterFailedTasks = [{ id: "status", values: failedProcessStatuses }];

const countFailedProcesses = (processes: ProcessWithStatus[]): CountFailedProcesses => {
    const groupStatuses = groupBy(processes, (p) => p.last_status);
    const failed = groupStatuses[ProcessStatus.FAILED]?.length || 0;
    const inconsistentData = groupStatuses[ProcessStatus.INCONSISTENT_DATA]?.length || 0;
    const apiUnavailable = groupStatuses[ProcessStatus.API_UNAVAILABLE]?.length || 0;
    return {
        failed,
        inconsistentData,
        apiUnavailable,
        all: failed + inconsistentData + apiUnavailable,
    };
};

export default function FailedTaskBanner() {
    const { runningProcesses, completedProcessIds, useFallback } = useContext(RunningProcessesContext);
    const [data, , fetchData] = useFailedTaskFetcher<FailedProcess>("processes/");
    const [failedProcesses, setFailedProcesses] = useState<FailedProcess[]>([]);
    const [failedTasks, setFailedTasks] = useState(countFailedProcesses([]));
    const history = useHistory();
    const handleOnClick = useCallback(() => history.push("/tasks"), [history]);

    useHttpIntervalFallback(useFallback, () => fetchData(0, 10, [], filterFailedTasks));

    useEffect(() => {
        const newList = [...data, ...runningProcesses.filter((p) => failedProcessStatuses.includes(p.last_status))];
        setFailedProcesses(newList.filter((p) => !completedProcessIds.includes(p.pid)));
    }, [data, runningProcesses, completedProcessIds]);

    useEffect(() => {
        setFailedTasks(countFailedProcesses(failedProcesses));
    }, [failedProcesses]);

    useEffect(() => {
        fetchData(0, 10, [], filterFailedTasks);
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    const renderTooltipContent = () => (
        <>
            <p>Failed: {failedTasks.failed}</p>
            <p>Inconsistent data: {failedTasks.inconsistentData}</p>
            <p>API unavailable: {failedTasks.apiUnavailable}</p>
        </>
    );

    const showTasksStatus = () => (failedTasks.all ? CheckboxStatus.FAILED : CheckboxStatus.OK);

    return (
        <div onClick={handleOnClick} className="failed-task-container">
            <EuiToolTip position="bottom" content={renderTooltipContent()}>
                <div className="failed-task-banner">
                    <i className={`fa fa-check-square failed-task-banner__icon ${showTasksStatus()}`} />
                    <EuiText grow={false} className="failed-task-banner__counter">
                        {failedTasks.all}
                    </EuiText>
                </div>
            </EuiToolTip>
        </div>
    );
}
