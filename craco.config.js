// Lots of info in
// https://stackoverflow.com/questions/65767551/how-to-setup-alias-for-jest-with-craco
// https://github.com/facebook/create-react-app/issues/3547


// const path = require('path');
// const {getLoader, loaderByName} = require('@craco/craco');
//
// // Relative paths to shared folders.
// // IMPORTANT: If you want to directly import these (no symlink) these folders must also be added to tsconfig.json {"compilerOptions": "rootDirs": [..]}
// const SRC_LOCATIONS = [
//     'src',
//     '../src',
// ];
//
// const updateWebpackConfig = {
//     overrideWebpackConfig: ({webpackConfig}) => {
//
//         // Get hold of the babel-loader, so we can add shared folders to it, ensuring that they get compiled too
//         const {match:{loader}} = getLoader(webpackConfig, loaderByName("babel-loader"));
//
//         loader.include = SRC_LOCATIONS.map(p => path.join(__dirname, p))
//
//         return webpackConfig;
//     }
// }
//
// const jestSingleModuleResolution = {
//     moduleNameMapper: {
//         '^react$': '<rootDir>/node_modules/react',
//         '^react-dom$': '<rootDir>/node_modules/react-dom',
//         '^react-router-dom$': '<rootDir>/node_modules/react-router-dom',
//     },
// };
//
//
//
// module.exports = {
//     plugins: [
//         {plugin: updateWebpackConfig, options: {}}
//     ]
// }


const path = require('path');
// const { whenProd } = require('@craco/craco');

/* Allows importing code from other packages in a monorepo. Explanation:
When you use lerna / yarn workspaces to import a package, you create a symlink in node_modules to
that package's location. By default Webpack resolves those symlinks to the package's actual path,
which makes some create-react-app plugins and compilers fail (in prod builds) because you're only
allowed to import things from ./src or from node_modules
 */
const disableSymlinkResolution = {
    plugin: {
        overrideWebpackConfig: ({ webpackConfig }) => {
            webpackConfig.resolve.symlinks = false;
            return webpackConfig;
        },
    },
};

const webpackSingleModulesResolution = {
    alias: {
        react$: path.resolve(__dirname, 'node_modules/react'),
        'react-dom$': path.resolve(__dirname, 'node_modules/react-dom'),
        'react-router-dom$': path.resolve(__dirname, 'node_modules/react-router-dom'),
    },
};

// const jestSingleModuleResolution = {
//     moduleNameMapper: {
//         '^react$': 'src/node_modules/react',
//         '^react-dom$': 'src/node_modules/react-dom',
//         '^react-router-dom$': 'src/node_modules/react-router-dom',
//     },
// };

module.exports = {
    plugins: [disableSymlinkResolution],
    // webpack: webpackSingleModulesResolution,
    // jest: {
    //     configure: {
    //         roots: ['<rootDir>/src', '<rootDir>/spec'],
    //         testMatch: ['<rootDir>/spec/**/*.{spec,test}.{js,jsx,ts,tsx}'],
    //     },
    // },
};
