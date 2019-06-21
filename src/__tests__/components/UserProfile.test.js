import React from "react";
import { shallow } from "enzyme";
import UserProfile from "../../components/UserProfile";
import start from "../base";
start();

test("UserProfile with email", () => {
    const currentUser = { email: "test@org.net", guest: true };
    const userProfile = shallow(<UserProfile currentUser={currentUser} />);
    expect(userProfile.contains(<span className="user-key">email</span>)).toBe(true);
});
