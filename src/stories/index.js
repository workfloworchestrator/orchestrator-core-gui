import React from 'react';

import { storiesOf } from '@storybook/react';
import { action } from '@storybook/addon-actions';
import { linkTo } from '@storybook/addon-links';

import { Button, Welcome } from '@storybook/react/demo';
import SubscriptionProductTagSelect from "../components/SubscriptionProductTagSelect";
import "../pages/App.scss"
import "./storybook.scss"
import GenericSelect from "../components/GenericSelect";
import UserInputWrapper from "./UserInputWrapper";

storiesOf('Welcome', module).add('to Storybook', () =>
    <div>

        <h1>Workflows client storybook</h1>
        <p>Welcome to the root of the storybook. We will demonstrate some of the components here.
            Please ensure that you have a valid proxy config. The storybook will try to use the same proxy config as
            the client normally uses, as detailed in the README.md.</p>
    </div>
)



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
            productId='077e6583-a1f8-42bd-87b0-60f7051c8d42'/>);


storiesOf('GenericSelect', module)
    .add('Default', () =>
        <GenericSelect onChange={(e) => {
            action('clicked');
            debugger;
            this.selected=e.value;
            e;
        }} choices={['SAP 1', 'SAP 2', 'SAP 3']}/>);

storiesOf('Wrapper', module)
    .add('Blaat', () =>
        <UserInputWrapper name="blaat" />
        <GenericSelect onChange={(e) => {
            action('clicked');
            debugger;
            this.selected=e.value;
            e;
        }} choices={['SAP 1', 'SAP 2', 'SAP 3']}/>);

