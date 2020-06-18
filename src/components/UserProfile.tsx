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

import { useAuth } from "oidc-react";
import React from "react";

export default function UserProfile() {
    const auth = useAuth();

    return (
        <ul className="user-profile">
            {Object.keys(auth.userData?.profile || []).map(key => (
                <li key={key} className="user-attribute">
                    <span className="user-key">{key.toString()}</span>
                    <span className="value">{auth.userData?.profile[key]}</span>
                </li>
            ))}
        </ul>
    );
}
