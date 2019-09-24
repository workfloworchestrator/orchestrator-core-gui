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

import React from "react";
import { mount } from "enzyme";
import UserProfile from "../../components/UserProfile";
import start from "../base";
import ApplicationContext from "../../utils/ApplicationContext";

start();

test("UserProfile with email", () => {
    const wrapper = mount(
        <ApplicationContext.Provider value={{ currentUser: { email: "test@org.net", guest: true } }}>
            <UserProfile />
        </ApplicationContext.Provider>
    );
    expect(wrapper.contains(<span className="user-key">email</span>)).toBeTruthy();
});
