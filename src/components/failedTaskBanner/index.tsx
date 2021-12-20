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

import "./FailedTaskBanner.scss";

import { EuiText, EuiToolTip } from "@elastic/eui";
import { groupBy } from "lodash";
import { useContext, useEffect, useState } from "react";
import { Process, ProcessStatus } from "utils/types";
import RunningProcessesContext from "websocketService/useRunningProcesses/RunningProcessesContext";

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

const filterFailedTasks = [{ id: "status", values: ["failed", "api_unavailable", "inconsistent_data"] }];

const countFailedProcesses = (processes: ProcessWithStatus[]) => {
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
    const { runningProcesses, useFallback } = useContext(RunningProcessesContext);
    const [failedTasks, setFailedTasks] = useState(countFailedProcesses(runningProcesses));
    const [data, , fetchData] = useFailedTaskFetcher<ProcessWithStatus>("processes/");
    const [httpInterval, setHttpInterval] = useState<NodeJS.Timeout | undefined>();

    const httpFailedProcessesFallback = () => {
        fetchData(0, 10, [], filterFailedTasks);

        setHttpInterval(
            setInterval(() => {
                fetchData(0, 10, [], filterFailedTasks);
            }, 3000)
        );
    };

    useEffect(() => {
        setFailedTasks(countFailedProcesses(runningProcesses));
    }, [runningProcesses]);

    useEffect(() => {
        setFailedTasks(countFailedProcesses(data));
    }, [data]);

    useEffect(() => {
        if (useFallback) {
            httpFailedProcessesFallback();
        }
        if (!useFallback && httpInterval) {
            clearInterval(httpInterval);
        }
    }, [useFallback]); // eslint-disable-line react-hooks/exhaustive-deps

    useEffect(() => {
        fetchData(0, 10, [], filterFailedTasks);
        return () => httpInterval && clearInterval(httpInterval);
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
        <EuiToolTip position="bottom" content={renderTooltipContent()}>
            <div className="failed-task-banner">
                <i className={`fa fa-check-square failed-task-banner__icon ${showTasksStatus()}`} />
                <EuiText grow={false} className="failed-task-banner__counter">
                    {failedTasks.all}
                </EuiText>
            </div>
        </EuiToolTip>
    );
}
