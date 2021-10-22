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
import useInterval from "components/tables/useInterval";
import { groupBy } from "lodash";
import { useEffect, useState } from "react";
import { ProcessStatus } from "utils/types";

import useFailedTaskFetcher from "./useFailedTaskFetcher";

enum TasksStatus {
    "OK" = "ok",
    "FAILED" = "failed",
}

interface ProcessWithStatus {
    last_status: string;
}

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
    const [data, , fetchData] = useFailedTaskFetcher<ProcessWithStatus>("processes/");
    const [failedTasks, setFailedTasks] = useState({
        all: 0,
        failed: 0,
        inconsistentData: 0,
        apiUnavailable: 0,
    });

    const filterBy = [
        { id: "isTask", values: ["true"] },
        { id: "status", values: ["failed", "api_unavailable", "inconsistent_data"] },
    ];

    useEffect(() => {
        setFailedTasks(countFailedProcesses(data));
    }, [data]);

    fetchData(0, 10, [], filterBy);

    /*
     * poll for updates at an interval. because this is a hook the interval will be
     * removed when the table is unmounted
     */
    const autoRefreshDelay = 3000;
    useInterval(() => {
        fetchData(0, 10, [], filterBy);
    }, autoRefreshDelay);

    const renderTooltipContent = () => (
        <>
            <p>Failed: {failedTasks.failed}</p>
            <p>Inconsistent data: {failedTasks.inconsistentData}</p>
            <p>API unavailable: {failedTasks.apiUnavailable}</p>
        </>
    );

    const showTasksStatus = () => (failedTasks.all ? TasksStatus.FAILED : TasksStatus.OK);

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
