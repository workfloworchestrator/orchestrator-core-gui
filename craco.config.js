// Allow webpack to follow symlinks:
module.exports = {
    webpack: {
        configure: (webpackConfig, { env, paths }) => ({
            ...webpackConfig,
            resolve: {
                ...webpackConfig.resolve,
                symlinks: false
            }
        })
    }
}
