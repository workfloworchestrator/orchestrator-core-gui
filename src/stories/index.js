import React from 'react';

import { storiesOf } from '@storybook/react';
import { action } from '@storybook/addon-actions';
import { linkTo } from '@storybook/addon-links';

import { Button, Welcome } from '@storybook/react/demo';
import SubscriptionProductTagSelect from "../components/SubscriptionProductTagSelect";
import "../pages/App.scss"
import "./storybook.scss"
import GenericSelect from "../components/GenericSelect";
import TableSummary from "../components/TableSummary";
import UserInputContainer from "./UserInputContainer";
import UserInputForm from "../components/UserInputForm";
import {LOCATION_CODES, ORGANISATIONS, PRODUCTS} from "./data";
// import UserInputWrapper from "./UserInputWrapper";

const genericSelectChoices = ['SAP 1', 'SAP 2', 'SAP 3'];
const tableSummaryDataDefinition = [
    {labels: ["Label1", "Label 2", "Label 3"]},
    {columns: [["value1", "value2", "value3 with slightly longer text"]]}];

const tableSummaryDataWithHeaders = [
    {headers: ["Old Values", "New Values"]},
    {columns: [
        ["value1", "value2", "value3"],
        ["new value1", "new value2", "new value3"]]
    }
];

const tableSummaryDataDefinitionWithHeaders = [
    {labels: ["Label1", "Label 2", "Label 3"]},
    {headers: ["Old Values", "New Values"]},
    {columns: [
        ["value1", "value2", "value3"],
        ["new value1", "new value2", "new value3"]]
    }
];

const corelinkInputSteps = [{"interface_type_key":"corelink_service_speed","name":"ims_port_id_1","type":"corelink"},{"interface_type_key":"corelink_service_speed","name":"ims_port_id_2","type":"corelink"}]

const sn8PortSelectInputSteps = [{"name":"organisation","type":"organisation"},{"name":"contact_persons","organisation_key":"organisation","type":"contact_persons"},{"name":"bandwidth","ports_key":["service_ports"],"readonly":false,"type":"bandwidth","value":null},{"maximum":6,"minimum":1,"name":"bgp_ip_service_ports","organisationPortsOnly":false,"organisation_key":"organisation","type":"service_ports_sn8","visiblePortMode":"normal"}];




storiesOf('Welcome', module).add('to Storybook', () =>
    <div>
        <h1>Workflows client storybook</h1>
        <p>Welcome to the root of the storybook. We will demonstrate some of the components here.
            The storybook will try to use the data from dev soon.</p>
        <p><b>But for now it uses mocks that will needs some dynamic stuff (ORGANISATIONS, PRODUCTS etc), to get it working with dev's data </b></p>
    </div>
);


storiesOf('SubscriptionProductTagSelect', module)
    .add('Only tags', () =>
        <SubscriptionProductTagSelect onChange={(e) => {
            action('clicked');
            debugger;
            e;
        }} tags={['SP', 'MSP']}/>)
    .add("Filtered on Product", () =>
        <SubscriptionProductTagSelect
            onChange={action('clicked')}
            tags={['IPS']}
            productId='077e6583-a1f8-42bd-87b0-60f7051c8d42'/>)
    .add("Filtered on Product with excluded subs", () =>
        <SubscriptionProductTagSelect
            onChange={action('clicked')}
            tags={['IPS']}
            productId='077e6583-a1f8-42bd-87b0-60f7051c8d42'
            excludedSubscriptionIds={['08ac5baa-4053-4d01-98e0-505e957d73c7']}
        />);


storiesOf('GenericSelect', module)
    .add('Default', () =>
        <GenericSelect onChange={(e) => {
            action('clicked');
            debugger;
            this.selected=e.value;
            e;
        }} choices={genericSelectChoices}/>);


storiesOf('TableSummary', module)
    .add('Definition', () =>
        <TableSummary onChange={(e) => {
            action('clicked');
            debugger;
            this.selected=e.value;
            e;
        }} data={tableSummaryDataDefinition}/>)
    .add('Summary with headers', () =>
        <TableSummary onChange={(e) => {
            action('clicked');
            debugger;
            this.selected=e.value;
            e;
        }} data={tableSummaryDataWithHeaders}/>)
    .add('Summary with definition and headers', () =>
        <TableSummary onChange={(e) => {
            action('clicked');
            debugger;
            this.selected=e.value;
            e;
        }} data={tableSummaryDataDefinitionWithHeaders}/>);

storiesOf('UserInputForm', module)
    .add('Corelink', () =>
        <UserInputContainer
            history=""
            currentUser=""
            organisations={ORGANISATIONS}
            locationCodes={LOCATION_CODES}
            stepUserInput={corelinkInputSteps}
            products={PRODUCTS}
            formName="Corelink form">
        </UserInputContainer>
    )
    .add('SN8 Portselect', () =>
        <UserInputContainer
            history=""
            currentUser=""
            organisations={ORGANISATIONS}
            locationCodes={LOCATION_CODES}
            stepUserInput={sn8PortSelectInputSteps}
            products={PRODUCTS}
            formName="SN8 portselect form">
        </UserInputContainer>
    )
