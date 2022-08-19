module.exports = {
    // change to .tsx if necessary
    entry: './src/index.tsx',
    resolve: {
        // changed from extensions: [".js", ".jsx"]
        extensions: ['.ts', '.tsx', '.js', '.jsx'],
    },
    module: {
        rules: [
            // newline - add source-map support
            { enforce: 'pre', test: /\.js$/, loader: 'source-map-loader' },
        ],
    },
    externals: {
        react: 'React',
        'react-dom': 'ReactDOM',
    },
    // newline - add source-map support
    devtool: 'source-map',
};
