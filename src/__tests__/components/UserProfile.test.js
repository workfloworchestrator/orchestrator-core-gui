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
