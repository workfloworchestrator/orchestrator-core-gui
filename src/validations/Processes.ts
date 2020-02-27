/*
 * Copyright 2019 SURF.
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

interface Action {
    icon: string;
    label: string;
    action: (e: React.MouseEvent<HTMLButtonElement>) => void;
    danger?: boolean;
}

interface WithStatus {
    status: string;
}

export function actionOptions<T extends WithStatus>(
    process: T,
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
        icon: "fa fa-pencil-square-o",
        label: "user_input",
        action: showAction
    };
    const retry = {
        icon: "fa fa-refresh",
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
    switch (process.status) {
        case "failed":
            options = [details, retry, abort, _delete];
            break;
        case "api_unavailable":
            options = [details, retry, abort, _delete];
            break;
        case "inconsistent_data":
            options = [details, retry, abort, _delete];
            break;
        case "waiting":
            options = [details, retry, abort, _delete];
            break;
        case "aborted":
            options = [details, _delete];
            break;
        case "running": //??
            options = [abort, _delete];
            break;
        case "completed":
            options = [details, _delete];
            break;
        case "suspended":
            options = [userInput, abort, _delete];
            break;
        case "created":
            options = [retry, abort, _delete];
            break;
        default:
            throw new Error(`Unknown status: ${process.status}`);
    }
    return options;
}
