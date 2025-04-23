import path from 'path';
import { fileURLToPath } from 'url';
import webpack from 'webpack';
import NodePolyfillPlugin from 'node-polyfill-webpack-plugin';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default {
    entry: './src/v1/index.mjs',
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: 'TinyEssentials.min.js',
        library: 'TinyEssentials',
        libraryTarget: 'window',
    },
    mode: 'production',
    plugins: [
        new NodePolyfillPlugin(),
        new webpack.ProvidePlugin({
            process: 'process/browser',
        }),
    ],
};
