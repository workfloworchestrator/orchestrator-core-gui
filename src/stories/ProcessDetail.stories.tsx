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

import { Meta } from "@storybook/react";
import mock from "axios-mock";
import ProcessDetail from "pages/ProcessDetail";
import React from "react";
import FAILED_PROCESS_JSON from "stories/data/process-failed.json";
import SUSPENDED_PROCESS_JSON from "stories/data/process-suspended.json";
import StoryRouter from "storybook-react-router";
import { QueryParamProvider } from "use-query-params";

export default {
    title: "ProcessDetail",
    decorators: [
        StoryRouter(),
        (Story) => (
            <QueryParamProvider>
                <Story />
            </QueryParamProvider>
        ),
    ],
    // Needed to match snapshot file to story, should be done by injectFileNames but that does not work
    parameters: {
        fileName: __filename,
    },
} as Meta;

export const Process = () => {
    mock.reset();
    mock.onGet("processes/pid").reply(200, FAILED_PROCESS_JSON);
    mock.onGet("processes/process-subscriptions-by-pid/1a5686d9-eaa2-4d0b-96eb-1ec081c62a08").reply(200, []);

    //@ts-ignore
    return <ProcessDetail match={{ params: { id: "pid" } }} isProcess={true} />;
};

export const Task = () => {
    mock.reset();
    mock.onGet("processes/pid").reply(200, FAILED_PROCESS_JSON);
    mock.onGet("processes/process-subscriptions-by-pid/1a5686d9-eaa2-4d0b-96eb-1ec081c62a08").reply(200, []);

    //@ts-ignore
    return <ProcessDetail match={{ params: { id: "pid" } }} isProcess={false} />;
};

export const SuspendedProcess = () => {
    mock.reset();
    mock.onGet("processes/pid").reply(200, SUSPENDED_PROCESS_JSON);
    mock.onGet("processes/process-subscriptions-by-pid/cdae2399-dd25-440b-81db-b8846c5fa3ce").reply(200, []);

    //@ts-ignore
    return <ProcessDetail match={{ params: { id: "pid" } }} isProcess={true} />;
};

export const SuspendedTask = () => {
    mock.reset();
    mock.onGet("processes/pid").reply(200, SUSPENDED_PROCESS_JSON);
    mock.onGet("processes/process-subscriptions-by-pid/cdae2399-dd25-440b-81db-b8846c5fa3ce").reply(200, []);

    //@ts-ignore
    return <ProcessDetail match={{ params: { id: "pid" } }} isProcess={false} />;
};
