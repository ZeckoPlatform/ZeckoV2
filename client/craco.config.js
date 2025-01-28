const ImageMinimizerPlugin = require('image-minimizer-webpack-plugin');
const { whenProd } = require('@craco/craco');

module.exports = {
    webpack: {
        configure: (webpackConfig) => {
            // Production only
            if (process.env.NODE_ENV === 'production') {
                // Enable production optimizations
                whenProd(() => {
                    webpackConfig.optimization = {
                        ...webpackConfig.optimization,
                        splitChunks: {
                            chunks: 'all',
                            minSize: 20000,
                            maxSize: 244000,
                            minChunks: 1,
                            maxAsyncRequests: 30,
                            maxInitialRequests: 30,
                            cacheGroups: {
                                defaultVendors: {
                                    test: /[\\/]node_modules[\\/]/,
                                    priority: -10,
                                    reuseExistingChunk: true,
                                },
                                default: {
                                    minChunks: 2,
                                    priority: -20,
                                    reuseExistingChunk: true,
                                },
                            },
                        },
                    };
                });
            }

            // Add image optimization
            webpackConfig.optimization.minimizer.push(
                new ImageMinimizerPlugin({
                    minimizer: {
                        implementation: ImageMinimizerPlugin.imageminMinify,
                        options: {
                            plugins: [
                                ['mozjpeg', { quality: 80 }],
                                ['pngquant', { quality: [0.65, 0.9] }],
                            ],
                        },
                    },
                })
            );

            return webpackConfig;
        },
    },
}; 