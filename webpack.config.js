module.exports = {

	devtool: 'cheap-module-eval-source-map',

	module: {
		loaders: [

			{
				test: /\.js$/,
				loader: 'babel-loader',
				exclude: /node_modules/,
				query: {
					presets: ['es2015']
				}
			},

		]
	}

}