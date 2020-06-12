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

import fetchMock from "fetch-mock";

export function vlanData() {
    let vlans = [];

    if (Math.random() * 3 >= 1) {
        const single = Math.floor(Math.random() * 10);
        vlans.push([single]);
    }
    if (Math.random() * 2 >= 1) {
        const start = Math.floor(Math.random() * 400) + 10;
        const end = Math.floor(Math.random() * 400) + 10 + start;
        vlans.push([start, end]);
    }
    return vlans;
}

export function loadVlanMocks() {
    fetchMock.get("glob:*/api/ims/vlans/0*", vlanData());
    fetchMock.get("glob:*/api/ims/vlans/1*", vlanData(), {
        overwriteRoutes: false
    });
    fetchMock.get("glob:*/api/ims/vlans/2*", vlanData(), {
        overwriteRoutes: false
    });
    fetchMock.get("glob:*/api/ims/vlans/3*", vlanData(), {
        overwriteRoutes: false
    });
    fetchMock.get("glob:*/api/ims/vlans/4*", vlanData(), {
        overwriteRoutes: false
    });
    fetchMock.get("glob:*/api/ims/vlans/5*", vlanData(), {
        overwriteRoutes: false
    });
    fetchMock.get("glob:*/api/ims/vlans/6*", vlanData(), {
        overwriteRoutes: false
    });
    fetchMock.get("glob:*/api/ims/vlans/7*", vlanData(), {
        overwriteRoutes: false
    });
    fetchMock.get("glob:*/api/ims/vlans/8*", vlanData(), {
        overwriteRoutes: false
    });
    fetchMock.get("glob:*/api/ims/vlans/9*", vlanData(), {
        overwriteRoutes: false
    });
    fetchMock.get("glob:*/api/ims/vlans/a*", vlanData(), {
        overwriteRoutes: false
    });
    fetchMock.get("glob:*/api/ims/vlans/b*", vlanData(), {
        overwriteRoutes: false
    });
    fetchMock.get("glob:*/api/ims/vlans/c*", vlanData(), {
        overwriteRoutes: false
    });
    fetchMock.get("glob:*/api/ims/vlans/d*", vlanData(), {
        overwriteRoutes: false
    });
    fetchMock.get("glob:*/api/ims/vlans/e*", vlanData(), {
        overwriteRoutes: false
    });
    fetchMock.get("glob:*/api/ims/vlans/f*", vlanData(), {
        overwriteRoutes: false
    });
}
