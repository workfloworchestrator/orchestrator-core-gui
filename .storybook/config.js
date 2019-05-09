import { addDecorator, addParameters, configure } from '@storybook/react';
import { themes } from '@storybook/theming';
import surfnetTheme from './surfnetTheme';

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

addParameters({
    options: {
        theme: surfnetTheme,
    },
});

configure(loadStories, module);
