var webpack = require('webpack')
var rm = require('rimraf')
var path = require('path')

var config = {
    entry: './src/tinyhand.js',
    output: {
        filename: 'tinyhand.min.js',
        path: path.resolve('./dist')
    },
    module: {
        rules: [
            {
                test: /\.js$/,
                loader: 'babel-loader',
                include: path.resolve('./src')
            }
        ]
    },
    watch: true,
    devtool: 'source-map',
    plugins: [
        // new webpack.optimize.UglifyJsPlugin()
    ]
}

rm('./dist', function(){
    webpack(config, function(err){
        if(err)throw err;
        console.log('ok')
    })
})