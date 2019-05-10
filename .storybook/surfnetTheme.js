import { create } from '@storybook/theming';

export default create({
    base: 'light',

    colorPrimary: 'black',
    colorSecondary: '#4DB2CF',

    // UI
    appBg: 'white',
    appContentBg: 'white',
    appBorderColor: '#4DB2CF',
    appBorderRadius: 4,

    // Typography
    fontBase: '"Roboto", sans-serif',
    fontCode: 'monospace',

    // Text colors
    textColor: 'black',
    textInverseColor: 'rgba(255,255,255,0.9)',

    // Toolbar default and active colors
    barTextColor: '#4DB2CF',
    barSelectedColor: '#4DB2CF',
    barBg: '#ECF9FE',

    // Form colors
    inputBg: 'white',
    inputBorder: 'red',
    inputTextColor: 'black',
    inputBorderRadius: 4,

    brandTitle: 'Orchestrator Storybook',
    brandUrl: 'https://orchestrator.dev.automation.net',
    brandImage: '/surfnet_logo.png',
});