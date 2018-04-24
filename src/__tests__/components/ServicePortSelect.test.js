import React from "react";
import {shallow} from "enzyme";
import ServicePortSelect from "../../components/ServicePortSelect";
import PropTypes from 'prop-types';
import start from "../base";
start();


test("ServicePortSelect with SSP", () => {
    const servicePort = {'tag': 'SSP'};
    const component_wrapper = shallow(
        <ServicePortSelect onChange={PropTypes.func.isRequired}
                           key={PropTypes.string.isRequired}
                           servicePort={'368f7799-b22a-4dae-a499-d7ac199bb36f'}
                           servicePorts={[]}
                           organisations={[]}
                           disabled={false}/>
    );
    expect(component_wrapper.instance().is_selectable(servicePort)).toBe(true);
});


test("ServicePortSelect with 'out of sync' MSP", () => {
    const servicePort = {'tag': 'MSP', 'insync': false};
    const component_wrapper = shallow(
        <ServicePortSelect onChange={PropTypes.func.isRequired}
                           key={PropTypes.string.isRequired}
                           servicePort={'368f7799-b22a-4dae-a499-d7ac199bb36f'}
                           servicePorts={[]}
                           organisations={[]}
                           disabled={false}/>
    );
    expect(component_wrapper.instance().is_selectable(servicePort)).toBe(false);
});


test("ServicePortSelect with 'in sync' MSP", () => {
    const servicePort = {'tag': 'MSP', 'insync': true};
    const component_wrapper = shallow(
        <ServicePortSelect onChange={PropTypes.func.isRequired}
                           key={PropTypes.string.isRequired}
                           servicePort={'368f7799-b22a-4dae-a499-d7ac199bb36f'}
                           servicePorts={[]}
                           organisations={[]}
                           disabled={false}/>
    );
    expect(component_wrapper.instance().is_selectable(servicePort)).toBe(true);
});