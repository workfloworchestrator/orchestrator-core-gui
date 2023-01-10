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

import { action } from "@storybook/addon-actions";
import { formDate } from "forms/Builder";
import { useState } from "react";

export default {
    title: "DatePicker",
};

export const DatePicker = () => {
    const [date, setDate] = useState(new Date(1));
    return formDate(
        "metadata.productBlocks.created_at",
        (d: any) => {
            action("onChange")(d);
            setDate(d);
        },
        false,
        date
    );
};
