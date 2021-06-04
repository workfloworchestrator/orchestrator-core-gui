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

import { ApiClient } from "api";
import React from "react";
import { Organization, Product } from "utils/types";

import { CustomApiClient } from "../api/custom";

export interface ApplicationContextInterface {
    organisations?: Organization[];
    locationCodes?: string[];
    products: Product[];
    assignees: string[];
    processStatuses: string[];
    redirect: (_url: string) => void;
    setLocale: (locale: string) => Promise<void>;
    allowed: (resource: string) => boolean;
    apiClient: ApiClient;
    customApiClient: CustomApiClient;
}

export const apiClient: ApiClient = new ApiClient();
export const customApiClient: CustomApiClient = new CustomApiClient();

// Don't just add stuff here. This is reserved for things that don't change during the lifetime of the application
let ApplicationContext = React.createContext<ApplicationContextInterface>({
    organisations: [],
    locationCodes: [],
    products: [],
    assignees: [],
    processStatuses: [],
    redirect: (_url: string) => {},
    setLocale: async (_locale: string) => {},
    allowed: (_resource: string) => false,
    apiClient: apiClient,
    customApiClient: customApiClient,
});

export default ApplicationContext;
