const webpack = require("webpack");
const path = require("path");
// const fs = require('fs');

const CleanWebpackPlugin = require("clean-webpack-plugin");
const nodeExternals = require("webpack-node-externals");
// const CopyWebpackPlugin = require('copy-webpack-plugin');
const UglifyJSPlugin = require("uglifyjs-webpack-plugin");

const PROJECT_PATHS = {
    src: path.resolve(__dirname, "server"),
    build: path.resolve(__dirname, "dist")
};

module.exports = {
    entry: [path.join(PROJECT_PATHS.src, "server.js")],
    target: "node",
    output: {
        path: PROJECT_PATHS.build,
        filename: "server.js",
        publicPath: "/"
    },
    module: {
        rules: [
            {
                test: /\.js$/,
                enforce: "pre",
                exclude: [path.resolve(__dirname, "/node_modules/")],
                loader: "eslint-loader"
            },
            {
                test: /\.js$/,
                loader: "babel-loader",
                exclude: [path.resolve(__dirname, "/node_modules/")],
                options: {
                    presets: [
                        ["env", {"targets": {"node": "current"}}],
                        "stage-3"
                    ]
                }
            },

        ]
    },
    externals: [nodeExternals()],
    plugins: [
        new webpack.DefinePlugin({"process.env.NODE_ENV": JSON.stringify(process.env.NODE_ENV || "development")}),
        new CleanWebpackPlugin([PROJECT_PATHS.build]),
    ].concat(process.env.NODE_ENV === "production" ? [
        new UglifyJSPlugin({
            sourceMap: true,
            uglifyOptions: {warnings: false}
        })
    ] : []),
    devtool: "source-map"
};
