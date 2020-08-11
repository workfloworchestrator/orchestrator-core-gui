module.exports = {
    stories: ["../src/**/*.stories.(md|(j|t)s)x"],
    addons: [
        "@storybook/preset-create-react-app",
        {
            name: "@storybook/addon-docs",
            options: { configureJSX: true }
        },
        "@storybook/addon-actions",
        "@storybook/addon-links",
        "@storybook/addon-knobs",
        "@sambego/storybook-state",
        "@storybook/addon-viewport/register"
    ]
};
