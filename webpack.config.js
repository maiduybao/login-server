const webpack = require('webpack');
const path = require('path');
const fs = require('fs');

const CleanWebpackPlugin = require("clean-webpack-plugin");
const nodeExternals = require('webpack-node-externals');
const CopyWebpackPlugin = require('copy-webpack-plugin');


const PROJECT_PATHS = {
    src: path.resolve(__dirname, "server"),
    build: path.resolve(__dirname, "dist")
};

module.exports = {
    entry: [path.join(PROJECT_PATHS.src, "server.js")],
    target: 'node',
    output: {
        path: PROJECT_PATHS.build,
        filename: 'server.js'
    },
    module: {
        rules: [{
            test: /\.js$/,
            loader: "babel-loader",
            exclude: [path.resolve(__dirname, "/node_modules/")],
            options: {
                presets: [
                    "es2015",
                    "stage-2"
                ]
            }
        },

        ]
    },
    externals: [nodeExternals()],
    plugins: [
        new CleanWebpackPlugin([PROJECT_PATHS.build])
    ],
    devtool: 'source-map'
};