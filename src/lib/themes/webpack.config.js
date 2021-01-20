const path = require("path");

module.exports = {
    mode: "production",
    entry: "./main.scss",
    output: {
        path: path.resolve(__dirname),
    },
    module: {
        rules: [
            {
                test: /\.s[ac]ss$/i,
                use: [
                    {
                        loader: "file-loader",
                        options: { outputPath: "./", name: "theme.css" },
                    },
                    // Compiles Sass to CSS
                    "sass-loader",
                ],
            },
        ],
    },
    performance: {
        maxAssetSize: 500000,
    },
};
