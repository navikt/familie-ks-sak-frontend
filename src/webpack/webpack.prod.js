import path from 'path';

import SentryCliPlugin from '@sentry/webpack-plugin';
import CompressionPlugin from 'compression-webpack-plugin';
import CssMinimizerWebpackPlugin from 'css-minimizer-webpack-plugin';
import ESLintPlugin from 'eslint-webpack-plugin';
import TerserWebpackPlugin from 'terser-webpack-plugin';
import merge from 'webpack-merge';

import baseConfig from './webpack.common.js';

const prodConfig = merge.mergeWithRules({
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
    plugins: [
        new ESLintPlugin({
            extensions: [`ts`, `tsx`],
        }),
        new CompressionPlugin({
            algorithm: 'gzip',
            test: /\.js$|\.css$|\.html$/,
            threshold: 10240,
            minRatio: 0.8,
        }),
        new SentryCliPlugin({
            include: 'frontend_production',
            org: 'nav',
            project: 'familie-ks-sak-frontend',
            authToken: process.env.SENTRY_AUTH_TOKEN,
            url: 'https://sentry.gc.nav.no/',
            release: process.env.SENTRY_RELEASE,
            urlPrefix: `~/assets`,
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            errorHandler: (err, invokeErr, compilation) => {
                compilation.warnings.push('Sentry CLI Plugin: ' + err.message);
            },
        }),
    ],
});

export default prodConfig;
