import path from 'path';

import { sentryWebpackPlugin } from '@sentry/webpack-plugin';
import CompressionPlugin from 'compression-webpack-plugin';
import CssMinimizerWebpackPlugin from 'css-minimizer-webpack-plugin';
import MiniCssExtractPlugin from 'mini-css-extract-plugin';
import TerserWebpackPlugin from 'terser-webpack-plugin';
import { mergeWithRules } from 'webpack-merge';

import baseConfig from './webpack.common.js';

const prodConfig = mergeWithRules({
    module: {
        rules: {
            test: 'match',
            use: 'replace',
        },
    },
})(baseConfig, {
    entry: [path.join(process.cwd(), 'src/frontend/index.tsx')],
    mode: 'production',
    devtool: 'source-map',
    output: {
        path: path.join(process.cwd(), 'frontend_production'),
        filename: '[name].[contenthash].js',
        publicPath: '/assets/',
    },
    optimization: {
        minimize: true,
        minimizer: [new TerserWebpackPlugin(), new CssMinimizerWebpackPlugin()],
        runtimeChunk: {
            name: 'runtime',
        },
        splitChunks: {
            chunks: 'all',
            cacheGroups: {
                styles: {
                    name: 'styles',
                    type: 'css/mini-extract',
                    chunks: 'all',
                    enforce: true,
                },
            },
        },
    },
    performance: {
        maxEntrypointSize: 800000,
        maxAssetSize: 800000,
    },
    module: {
        rules: [
            {
                test: /\.module\.css$/,
                use: [
                    'style-loader',
                    {
                        loader: 'css-loader',
                        options: {
                            modules: {
                                namedExport: false,
                            },
                            importLoaders: 1,
                        },
                    },
                ],
            },
            {
                test: /\.css$/,
                exclude: /\.module\.css$/,
                use: [
                    MiniCssExtractPlugin.loader,
                    {
                        loader: 'css-loader',
                        options: {
                            modules: {
                                mode: 'icss',
                            },
                            importLoaders: 2,
                        },
                    },
                    {
                        loader: 'postcss-loader',
                        options: {
                            postcssOptions: {
                                plugins: [['autoprefixer']],
                            },
                        },
                    },
                ],
            },
        ],
    },
    plugins: [
        new MiniCssExtractPlugin(),
        new CompressionPlugin({
            algorithm: 'gzip',
            test: /\.js$|\.css$|\.html$/,
            threshold: 10240,
            minRatio: 0.8,
        }),
        sentryWebpackPlugin({
            org: 'nav',
            project: 'familie-ks-sak-frontend',
            authToken: process.env.SENTRY_AUTH_TOKEN,
            url: 'https://sentry.gc.nav.no/',
            release: {
                name: process.env.SENTRY_RELEASE,
                uploadLegacySourcemaps: {
                    paths: ['frontend_production'],
                    urlPrefix: `~/assets`,
                },
            },
            errorHandler: err => {
                console.warn('Sentry CLI Plugin: ' + err.message);
            },
        }),
    ],
});

export default prodConfig;
