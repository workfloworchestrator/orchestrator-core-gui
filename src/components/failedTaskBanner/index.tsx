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

import { EuiFlexItem, EuiText, EuiToolTip } from "@elastic/eui";
import RunningProcessesContext from "contextProviders/runningProcessesProvider";
import { useCallback, useContext, useEffect, useState } from "react";
import { useHistory } from "react-router";
import ApplicationContext from "utils/ApplicationContext";
import { Process, ProcessStatus, ProcessStatusCounts } from "utils/types";
import useHttpIntervalFallback from "utils/useHttpIntervalFallback";

import { failedTaskBannerStyling } from "./FailedTaskBannerStyling";

enum CheckboxStatus {
    "OK" = "ok",
    "FAILED" = "failed",
}
export interface ProcessData extends Process {
    id: string;
    status: ProcessStatus;
}

interface CountFailedTasks {
    failed: number;
    inconsistentData: number;
    apiUnavailable: number;
    all: number;
}

const countFailedTasks = (summary?: ProcessStatusCounts): CountFailedTasks => {
    const failed = summary?.task_counts.failed ?? 0;
    const inconsistentData = summary?.task_counts.inconsistent_data ?? 0;
    const apiUnavailable = summary?.task_counts.api_unavailable ?? 0;
    return {
        failed,
        inconsistentData,
        apiUnavailable,
        all: failed + inconsistentData + apiUnavailable,
    };
};

export default function FailedTaskBanner() {
    const { runningProcesses, completedProcessIds, useFallback } = useContext(RunningProcessesContext);
    const { apiClient } = useContext(ApplicationContext);
    const [summary, setSummary] = useState<ProcessStatusCounts>();
    const [failedTasks, setFailedTasks] = useState<CountFailedTasks>(countFailedTasks(summary));
    const history = useHistory();
    const handleOnClick = useCallback(() => history.push("/tasks"), [history]);

    const getSummary = useCallback(async () => {
        let res = await apiClient.processStatusCounts();
        setSummary(res);
    }, [apiClient, setSummary]);

    useHttpIntervalFallback(useFallback, getSummary);

    useEffect(() => {
        getSummary();
    }, [getSummary, runningProcesses, completedProcessIds]);

    useEffect(() => {
        setFailedTasks(countFailedTasks(summary));
    }, [summary]);

    const renderTooltipContent = () => (
        <>
            <p>Failed: {failedTasks.failed}</p>
            <p>Inconsistent data: {failedTasks.inconsistentData}</p>
            <p>API unavailable: {failedTasks.apiUnavailable}</p>
        </>
    );

    const showTasksStatus = () => (failedTasks.all ? CheckboxStatus.FAILED : CheckboxStatus.OK);

    return (
        <EuiFlexItem css={failedTaskBannerStyling}>
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
        </EuiFlexItem>
    );
}
