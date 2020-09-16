const path = require("path");

module.exports = {
    mode: "production",
    entry: "./surfnet_light.scss",
    output: {
        path: path.resolve(__dirname)
    },
    module: {
        rules: [
            {
                test: /\.s[ac]ss$/i,
                use: [
                    {
                        loader: "file-loader",
                        options: { outputPath: "./", name: "[name].css" }
                    },
                    // Compiles Sass to CSS
                    "sass-loader"
                ]
            }
        ]
    },
    performance: {
        maxAssetSize: 500000
    }
};
