import axios from "axios";
import { ENV } from "env";

import mySpinner from "../lib/Spin";
import { setFlash } from "../utils/Flash";

let calls = 0;

const apiPath = ENV.BACKEND_URL + "/api/";
// basic configuration for axios.
// the 'Authorization' header is set in
// index.ts:setUser
const axiosConfig = {
    baseURL: apiPath,
    headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        post: {
            "Content-Type": "application/json"
        },
        put: {
            "Content-Type": "application/json"
        }
    }
};

const axiosInstance = axios.create(axiosConfig);
axiosInstance.interceptors.request.use(config => {
    calls++;
    mySpinner.start();
    return config;
});

axiosInstance.interceptors.response.use(
    response => {
        calls--;
        if (calls <= 0) {
            mySpinner.stop();
        }
        return response;
    },
    error => {
        calls--;
        if (calls <= 0) {
            mySpinner.stop();
        }
        if (error.response) {
            if (error.response.status >= 400 && error.response.status < 500) {
                setFlash(error.response.data.body, "warning");
            } else if (error.response.status >= 500) {
                setFlash(error.response.data.body, "error");
            }
        }
        return Promise.reject(error);
    }
);
export default axiosInstance;
