const path = require('path');

module.exports = {
    entry: './index.js',
    output: {
        filename: 'cache.js',
        path: path.resolve(__dirname, 'dist')
    },
    module: {
        loaders: [
            {test: /\.js$/, loader: 'babel', exclude: /node_modules/}
        ]
    },
    babel: {
        presets: ['es2015'],
        plugins: ['transform-runtime']
    }
};