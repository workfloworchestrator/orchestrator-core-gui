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

import { ComponentMeta, ComponentStory } from "@storybook/react";
import mock from "axios-mock";
import NewProcess from "pages/NewProcess";
import React from "react";
import { Organisation, createForm } from "stories/utils";
import StoryRouter from "storybook-react-router";

export default {
    title: "NewProcess",
    component: NewProcess,
    decorators: [StoryRouter()],
} as ComponentMeta<typeof NewProcess>;

export const Default: ComponentStory<typeof NewProcess> = () => {
    mock.onGet(/products\/.*\/validate/).reply(200, [1000]);
    mock.onPost(/processes\/.*/).reply(510, {
        form: createForm({ organisation: Organisation }),
        hasNext: false,
    });

    return <NewProcess preselectedInput={{}} />;
};

export const Preselected: ComponentStory<typeof NewProcess> = () => {
    mock.reset();
    mock.onGet(/products\/.*\/validate/).reply(200, [1000]);
    mock.onPost(/processes\/.*/).reply(510, {
        form: createForm({ organisation: Organisation }),
        hasNext: false,
    });

    return (
        <NewProcess
            preselectedInput={{
                product: "a3bf8b26-50a6-4586-8e58-ad552cb39798",
                organisation: "9865c1cb-0911-e511-80d0-005056956c1a",
                prefix: "10.0.0.0",
                prefixlen: "10",
                prefix_min: "29",
            }}
        />
    );
};
