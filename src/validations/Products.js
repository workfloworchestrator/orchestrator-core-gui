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

import { isEmpty } from "../utils/Utils";

export function filterProductsByBandwidth(products, bandwidth) {
    return products.filter(prod => {
        const fixedInputs = prod.fixed_inputs;
        if (fixedInputs && !isEmpty(bandwidth)) {
            const speed = fixedInputs.find(fi => fi.name === "port_speed");
            if (speed && parseInt(speed.value, 10) < parseInt(bandwidth, 10)) {
                return false;
            }
        }
        return true;
    });
}

export const TARGET_CREATE = "CREATE";
export const TARGET_MODIFY = "MODIFY";
export const TARGET_TERMINATE = "TERMINATE";
