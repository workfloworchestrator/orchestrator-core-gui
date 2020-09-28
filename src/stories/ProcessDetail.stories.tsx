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

import fetchMock from "fetch-mock";
import ProcessDetail from "pages/ProcessDetail";
import React from "react";
import FAILED_PROCESS_JSON from "stories/data/process-failed.json";
import SUSPENDED_PROCESS_JSON from "stories/data/process-suspended.json";
import StoryRouter from "storybook-react-router";

export default {
    title: "ProcessDetail",
    decorators: [StoryRouter()],
    // Needed to match snapshot file to story, should be done by injectFileNames but that does not work
    parameters: {
        fileName: __filename
    }
};

export const Process = () => {
    fetchMock.restore();
    fetchMock.get("/api/processes/pid", FAILED_PROCESS_JSON);
    fetchMock.get("/api/processes/process-subscriptions-by-pid/1a5686d9-eaa2-4d0b-96eb-1ec081c62a08", []);

    //@ts-ignore
    return <ProcessDetail match={{ params: { id: "pid" } }} isProcess={true} />;
};

export const Task = () => {
    fetchMock.restore();
    fetchMock.get("/api/processes/pid", FAILED_PROCESS_JSON);
    fetchMock.get("/api/processes/process-subscriptions-by-pid/1a5686d9-eaa2-4d0b-96eb-1ec081c62a08", []);

    //@ts-ignore
    return <ProcessDetail match={{ params: { id: "pid" } }} isProcess={false} />;
};

export const SuspendedProcess = () => {
    fetchMock.restore();
    fetchMock.get("/api/processes/pid", SUSPENDED_PROCESS_JSON);
    fetchMock.get("/api/processes/process-subscriptions-by-pid/cdae2399-dd25-440b-81db-b8846c5fa3ce", []);

    //@ts-ignore
    return <ProcessDetail match={{ params: { id: "pid" } }} isProcess={true} />;
};

export const SuspendedTask = () => {
    fetchMock.restore();
    fetchMock.get("/api/processes/pid", SUSPENDED_PROCESS_JSON);
    fetchMock.get("/api/processes/process-subscriptions-by-pid/cdae2399-dd25-440b-81db-b8846c5fa3ce", []);

    //@ts-ignore
    return <ProcessDetail match={{ params: { id: "pid" } }} isProcess={false} />;
};
