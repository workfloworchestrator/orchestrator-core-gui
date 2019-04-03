import { addDecorator, configure } from '@storybook/react';
import React from "react";

function loadStories() {
  require('../src/stories');
}

const withContainerSection = (cb) => (
    <section className="storybook-container">
        {cb()}
    </section>
);

addDecorator(withContainerSection);

configure(loadStories, module);
