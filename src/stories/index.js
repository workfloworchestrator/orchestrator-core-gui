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
// import UserInputWrapper from "./UserInputWrapper";

const genericSelectChoices = ['SAP 1', 'SAP 2', 'SAP 3'];
const tabbleSummaryData = [
    {label: 'Label 1', value: 'Short value'},
    {label: "Label numero dos", value: "A slightly longer value"},
    {label: "Label 3", value: "Lorem ipsum dosem solem"},
    {label: "Label 4", value: "Brand, Alfa, Hertog Jan"},
    {label: "Label 5", value: "3"},
    {label: "Label 6", value: "Some examples"},
    ];


storiesOf('Welcome', module).add('to Storybook', () =>
    <div>
        <h1>Workflows client storybook</h1>
        <p>Welcome to the root of the storybook. We will demonstrate some of the components here.
            Please ensure that you have a valid proxy config. The storybook will try to use the same proxy config as
            the client normally uses, as detailed in the README.md.</p>
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
    .add('Default', () =>
        <TableSummary onChange={(e) => {
            action('clicked');
            debugger;
            this.selected=e.value;
            e;
        }} data={tabbleSummaryData}/>);
