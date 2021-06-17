var path = require('path');

module.exports = {
    mode: "development",
    entry: {
        main: './src/renderer/index.js',
        secondary: './src/renderer/secondary.js'
    },
    output: {
        path: path.join(__dirname, '/src/public/src/'),
        filename: '[name].bundle.js'
    },
    module: {
        rules: [
        {
            test: /\.js$|.jsx$/,
            exclude: /node_modules/,
            use: {
                loader: 'babel-loader'
            }
        },
        {
            test: /\.css$|.scss$/,
            use: [{
                loader: 'style-loader'
            },
            {
                loader: 'css-loader'
            },
            {
                loader: 'sass-loader'
            }]
        },
        {
            test: /\.svg$/,
            use: [
                {
                    loader: 'file-loader',
                    options: {
                        name: '[name].[ext]',
                        outputPath: 'assets'
                    }
                }
            ]
        }
    ]
    },
    devServer: {
        contentBase: path.join(__dirname, '/src/public'),
        compress: true,
        port: 8080
    }
}