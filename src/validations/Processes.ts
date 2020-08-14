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
import { Action, Process, ProcessV2, ProcessWithDetails } from "../utils/types";

type ProcessWithStatus = Process | ProcessWithDetails | ProcessV2;

const isProcessWithDetails = (process: any): process is ProcessWithDetails =>
    (process as ProcessWithDetails).status !== undefined;

export function actionOptions(
    process: ProcessWithStatus,
    showAction: (e: React.MouseEvent<HTMLButtonElement>) => void,
    retryAction: (e: React.MouseEvent<HTMLButtonElement>) => void,
    deleteAction: (e: React.MouseEvent<HTMLButtonElement>) => void,
    abortAction: (e: React.MouseEvent<HTMLButtonElement>) => void
): Action[] {
    //TODO scope on the context of logged in-user
    const details = {
        icon: "fa fa-search-plus",
        label: "details",
        action: showAction
    };
    const userInput = {
        icon: "fa fa-edit",
        label: "user_input",
        action: showAction
    };
    const retry = {
        icon: "fa fa-sync",
        label: "retry",
        action: retryAction
    };
    const _delete = {
        icon: "fa fa-trash",
        label: "delete",
        action: deleteAction,
        danger: true
    };
    const abort = {
        icon: "fa fa-window-close",
        label: "abort",
        action: abortAction,
        danger: true
    };
    let options = [];
    let status = "";
    if (isProcessWithDetails(process)) {
        status = process.status;
    } else {
        status = process.last_status;
    }

    switch (status) {
        case "failed":
            options = [details, retry, abort];
            if (process.is_task) {
                options.push(_delete);
            }
            break;
        case "api_unavailable":
            options = [details, retry, abort];
            if (process.is_task) {
                options.push(_delete);
            }
            break;
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
        case "running": //??
            options = [details, abort];
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
            throw new Error(`Unknown status: ${status}`);
    }
    return options;
}
