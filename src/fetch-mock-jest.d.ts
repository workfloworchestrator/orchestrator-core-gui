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

declare module "fetch-mock-jest" {
    import { FetchMockSandbox, FetchMockStatic, MockCall } from "fetch-mock";
    import { InspectionFilter, InspectionOptions } from "fetch-mock";

    interface FetchMockJestSandbox {
        sandbox(): jest.MockInstance<Response, MockCall> & FetchMockSandbox;
    }

    export type FetchMockJest = jest.MockInstance<Response, MockCall> & FetchMockJestSandbox & FetchMockStatic;

    const fetchMockJest: FetchMockJest;

    export default fetchMockJest;
}

declare namespace jest {
    interface Matchers<R, T> {
        toHaveFetched(filter?: InspectionFilter, options?: InspectionOptions): R;
        toHaveLastFetched(filter?: InspectionFilter, options?: InspectionOptions): R;
        toHaveNthFetched(n: number, filter?: InspectionFilter, options?: InspectionOptions): R;
        toHaveFetchedTimes(times: number, filter?: InspectionFilter, options?: InspectionOptions): R;
        toBeDone(filter?: InspectionFilter): R;
    }
}
