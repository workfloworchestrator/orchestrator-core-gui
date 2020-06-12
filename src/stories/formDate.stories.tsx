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

import "react-datepicker/dist/react-datepicker.css";

import { State, Store } from "@sambego/storybook-state";
import { action } from "@storybook/addon-actions";
import React from "react";

import { formDate } from "../forms/Builder";

const store = new Store({
    date: new Date(1)
});

export default {
    title: "DatePicker",
    // Needed to match snapshot file to story, should be done by injectFileNames but that does not work
    parameters: {
        fileName: __filename
    }
};

export const _Definition = () => (
    <State store={store}>
        {state =>
            formDate(
                "metadata.productBlocks.created_at",
                (e: any) => {
                    action("onChange")(e);
                    store.set({ date: e });
                },
                false,
                state.date
            )
        }
    </State>
);
