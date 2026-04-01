const webpack = require('webpack');

module.exports = {
  style: {
    postcss: {
      loaderOptions: (postcssLoaderOptions) => {
        postcssLoaderOptions.postcssOptions.plugins = [
          require("@tailwindcss/postcss"),
          require("autoprefixer"),
        ];
        return postcssLoaderOptions;
      },
    },
  },
  webpack: {
    plugins: {
      add: [
        new webpack.ProvidePlugin({
          Buffer: ['buffer', 'Buffer'],
          process: 'process', // 👈 Changed from 'process/browser'
        }),
      ],
    },
    configure: (webpackConfig) => {
      webpackConfig.resolve.fallback = {
        ...webpackConfig.resolve.fallback,
        stream: require.resolve('stream-browserify'),
        buffer: require.resolve('buffer'),
        process: require.resolve('process/browser.js'), // 👈 Added .js extension
      };
      // This line helps fix the ESM "fully specified" error
      webpackConfig.module.rules.push({
        test: /\.m?js/,
        resolve: {
          fullySpecified: false,
        },
      });
      return webpackConfig;
    },
  },
};