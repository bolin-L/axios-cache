const path = require('path');

module.exports = {
    entry: './src/cache.js',
    output: {
        filename: 'cache.js',
        path: path.resolve(__dirname, 'dist'),
        libraryTarget: 'commonjs2'
    },
    module: {
        loaders: [{
            test: /\.js$/,
            exclude: /node_modules/,
            loader: 'babel-loader',
        }]
    },
    babel: {
        presets: ['es2015']
    }
};