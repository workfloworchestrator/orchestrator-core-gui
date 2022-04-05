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

import { EventEmitter } from "events";

export const emitter = new EventEmitter();

export interface FlashData {
    type: string;
    message: string;
}

//sneaky global...
let flash: FlashData | null = null;

export function getFlash(): FlashData | null {
    return flash ? { ...flash } : null;
}

export function setFlash(message: string, type?: string) {
    flash = { message, type: type || "info" };
    emitter.emit("flash", flash);
}

export function clearFlash() {
    emitter.emit("flash", {});
}
