import path from 'path';

import ReactRefreshWebpackPlugin from '@pmmmwh/react-refresh-webpack-plugin';
import ESLintPlugin from 'eslint-webpack-plugin';
import webpack from 'webpack';
import merge from 'webpack-merge';

import baseConfig from './webpack.common.js';

export default merge.mergeWithRules({
    module: {
        rules: {
            test: 'match',
            options: 'replace',
        },
    },
})(baseConfig, {
    mode: 'development',
    entry: ['webpack-hot-middleware/client'],
    plugins: [
        new ReactRefreshWebpackPlugin(),
        new webpack.HotModuleReplacementPlugin(),
        new ESLintPlugin({
            cache: true,
            extensions: [`ts`, `tsx`],
        }),
    ],
    output: {
        path: path.join(process.cwd(), 'frontend_development'),
        publicPath: '/assets',
    },
    module: {
        rules: [
            {
                test: /\.(jsx|tsx|ts|js)?$/,
                exclude: /node_modules/,
                loader: 'babel-loader',
                options: {
                    plugins: ['react-refresh/babel'],
                    cacheCompression: false,
                    cacheDirectory: true,
                },
            },
        ],
    },
    cache: {
        type: 'filesystem',
    },
});
