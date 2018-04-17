import React from "react";
import {shallow} from "enzyme";
import UserProfile from "../../components/ServicePortSelect";
import start from "../base";
start();


test("ServicePortSelect with email", () => {
    const {onChange, servicePort, servicePorts, organisations, disabled} = this.props;
    const servicePortSelect = shallow(
        <ServicePortSelect key={index} onChange={this.onChangeInternal("subscription_id", index)}
                           servicePort={servicePort.subscription_id}
                           servicePorts={inSelect}
                           organisations={organisations}
                           disabled={disabled}/>
    );

    expect(userProfile.contains(<span className="user-key">email</span>)).toBe(true);

});