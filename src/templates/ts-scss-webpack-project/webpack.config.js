const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const WebpackBuildNotifierPlugin = require('webpack-build-notifier');
const webpack = require('webpack')
const MinifyPlugin = require("babel-minify-webpack-plugin");
const VueLoaderPlugin = require('vue-loader/lib/plugin')
const OptimizeCSSAssetsPlugin = require('optimize-css-assets-webpack-plugin');
const path = require('path');

module.exports = {
    mode: process.env.NODE_ENV,
    entry: [
        './src/js/app.ts',
        './src/sass/app.scss'
    ],
    performance: {
        hints: false,
    },
    output: {
        pathinfo: false,
        path: path.resolve(__dirname, 'dist'),
        filename: 'js/build.js'
    },
    plugins: [
        new MiniCssExtractPlugin({
            filename: 'css/app.css',
            chunkFilename: 'css/app.css',
            ignoreOrder: false,
        }),
        new WebpackBuildNotifierPlugin({
            title: "Aanvragen Development",
            logo: 'https://s3.eu-central-1.amazonaws.com/static.vergelijkdirect/vergelijkdirect/logo/logo-small.jpg',
        }),
        new VueLoaderPlugin(),
    ],
    module: {
        rules: [
            {
                test: /\.vue$/,
                loader: 'vue-loader',
                options: {
                  loaders: {
                    'scss': 'vue-style-loader!css-loader!sass-loader',
                    'sass': 'vue-style-loader!css-loader!sass-loader?indentedSyntax',
                  }
                }
            },
            {
                test: /\.tsx?$/,
                loader: 'ts-loader',
                exclude: /node_modules/,
                options: {
                    appendTsSuffixTo: [/\.vue$/],
                    transpileOnly: true,
                    experimentalWatchApi: true,
                }
            },
            {
                test: /\.js$/,
                exclude: /node_modules/,
                use: {
                  loader: 'babel-loader',
                  options: {
                    presets: ['@babel/preset-env']
                  }
                }
            },
            {
                test: /\.css$/i,
                use: [
                    {
                    loader: MiniCssExtractPlugin.loader,
                    options: {
                            publicPath: '../',
                        },
                    },
                    'css-loader', 
                ],
            },
            {
                test: /\.scss$/i,
                use: [
                    {
                    loader: MiniCssExtractPlugin.loader,
                    options: {
                            publicPath: '../',
                        },
                    },
                    'css-loader', 
                    'sass-loader',
                ],
            },
        ],
    },
    devtool: 'eval-source-map',
    resolve: {
        extensions: ['.ts', '.js', '.vue', '.json', '.scss'],
        alias: {
          'vue$': 'vue/dist/vue.esm.js'
        }
    },
};

if (process.env.NODE_ENV === 'production') {
    module.exports.devtool = ''
    module.exports.optimization = {
        minimizer: [new MinifyPlugin(), new OptimizeCSSAssetsPlugin({
            cssProcessorPluginOptions: {
                preset: ['default', { discardComments: { removeAll: true } }],
            },
        })],
    },
    module.exports.plugins = (module.exports.plugins || []).concat([
        new webpack.DefinePlugin({
            'process.env': {
                NODE_ENV: '"production"'
            }
        })
    ])
}

if (process.env.NODE_ENV === 'development') {
    module.exports.optimization = {
        removeAvailableModules: false,
        removeEmptyChunks: false,
        splitChunks: false,
    }
}