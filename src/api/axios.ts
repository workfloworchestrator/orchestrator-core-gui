/*
 * Copyright 2020-2021 SURF.
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

import axios, { AxiosRequestConfig } from "axios";
import { User } from "oidc-client";

import { ENV } from "../env";
import mySpinner from "../lib/Spin";
import { setFlash } from "../utils/Flash";

let calls = 0;
const apiPath = ENV.BACKEND_URL + "/api/";

function decrementCalls() {
    calls--;
    console.log(`calls: ${calls}`);
    if (calls <= 0) {
        mySpinner.stop();
    }
}

// basic configuration for axios.
// the 'Authorization' header is set in
// index.ts:setUser
const axiosConfig: AxiosRequestConfig = {
    baseURL: apiPath,
    headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        // post: {
        //     "Content-Type": "application/json",
        // },
        // put: {
        //     "Content-Type": "application/json",
        // },
    },
};
const axiosInstance = axios.create(axiosConfig);
axiosInstance.interceptors.request.use(
    (config) => {
        calls++;
        mySpinner.start();
        console.log(`calls: ${calls} -> new call to ${config.url}`);
        return config;
    },
    (error) => {
        decrementCalls();
        return Promise.reject(error);
    }
);

axiosInstance.interceptors.response.use(
    (response) => {
        decrementCalls();
        return response;
    },
    (error) => {
        decrementCalls();

        if (error.response) {
            if (error.response.status >= 500 && error.response.data?.body) {
                setFlash(error.response.data.body, "error");
            }
        }
        return Promise.reject(error);
    }
);

export default axiosInstance;

export function setUser(_user: User | null) {
    // @ts-ignore
    axiosInstance.defaults.headers.common["Authorization"] = `${_user?.token_type} ${_user?.access_token}`;
}
