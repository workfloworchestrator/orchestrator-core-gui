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

import moment, { Moment } from "moment-timezone";

export function utcTimestampToLocalMoment(utc_timestamp: number) {
    // Convert UTC timestamp to localized Moment object
    return moment.unix(utc_timestamp).tz(moment.tz.guess() ?? "Europe/Amsterdam");
}

export function localMomentToUtcTimestamp(local_moment: Moment) {
    // Convert localized Moment object to UTC timestamp
    return local_moment.unix();
}
