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
import { Action, Process, ProcessV2, ProcessWithDetails } from "utils/types";

type ProcessWithStatus = Process | ProcessWithDetails | ProcessV2;

export function actionOptions(
    allowed: (resource: string) => boolean,
    process: ProcessWithStatus,
    showAction: (e: React.MouseEvent<HTMLButtonElement>) => void,
    retryAction: (e: React.MouseEvent<HTMLButtonElement>) => void,
    deleteAction: (e: React.MouseEvent<HTMLButtonElement>) => void,
    abortAction: (e: React.MouseEvent<HTMLButtonElement>) => void
): Action[] {
    //TODO scope on the context of logged in-user
    const details = {
        icon: "fa fa-search-plus",
        euiIcon: "search",
        label: "details",
        action: showAction,
    };
    const userInput = {
        icon: "fa fa-edit",
        euiIcon: "pencil",
        label: "user_input",
        action: showAction,
    };
    const retry = {
        icon: "fa fa-sync",
        euiIcon: "refresh",
        label: "retry",
        action: retryAction,
    };
    const _delete = {
        icon: "fa fa-trash",
        euiIcon: "trash",
        label: "delete",
        action: deleteAction,
        danger: true,
    };
    const abort = {
        icon: "fa fa-window-close",
        euiIcon: "crossInACircleFilled",
        label: "abort",
        action: abortAction,
        danger: true,
    };
    let options = [];

    switch (process.last_status) {
        case "failed":
        case "api_unavailable":
        case "inconsistent_data":
            options = [details, retry, abort];
            if (process.is_task) {
                options.push(_delete);
            }
            break;
        case "waiting":
            options = [details, retry, abort];
            break;
        case "aborted":
            options = [details];
            if (process.is_task) {
                options.push(_delete);
            }
            break;
        case "running":
        case "awaiting_callback":
            options = [details, abort];
            break;
        case "resumed":
            options = [details];
            break;
        case "completed":
            options = [details];
            if (process.is_task) {
                options.push(_delete);
            }
            break;
        case "suspended":
            options = [userInput, abort];
            break;
        case "created":
            options = [retry, abort];

            if (process.is_task) {
                options.push(_delete);
            }
            break;
        default:
            throw new Error(`Unknown status: ${process.last_status}`);
    }

    //@ts-ignore
    const process_id = process.id ?? process.process_id;

    options = options.filter((option) => allowed("/orchestrator/processes/" + option.label + "/" + process_id + "/"));

    return options;
}
