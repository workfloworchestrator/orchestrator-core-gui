module.exports = {
    core: {
        builder: "webpack5",
    },
    stories: ["../src/stories/**/*.stories.@(md|js|ts)x", "../src/lib/**/*.stories.@(md|js|ts)x"],
    addons: [
        "@storybook/preset-create-react-app",
        {
            name: "@storybook/addon-docs",
            options: { configureJSX: true },
        },
        "@storybook/addon-actions",
        "@storybook/addon-links",
        "@storybook/addon-knobs",
        "@storybook/addon-viewport/register",
        "storybook-addon-intl/register",
    ],
};
