import path from 'path';
import { fileURLToPath } from 'url';
import webpack from 'webpack';
import NodePolyfillPlugin from 'node-polyfill-webpack-plugin';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Add modules
const modules = [];
const addModule = (entry, library, isClass = false) => {
  const baseConfig = {
    entry,
    output: {
      path: path.resolve(__dirname, 'dist'),
      library,
      libraryTarget: 'window',
      libraryExport: isClass ? library : undefined,
    },
    optimization: {
      runtimeChunk: false,
      splitChunks: false,
    },
    plugins: [
      new NodePolyfillPlugin(),
      new webpack.ProvidePlugin({
        process: 'process/browser',
      }),
    ],
  };
  modules.push(
    // Non-minified version
    {
      ...baseConfig,
      mode: 'development',
      output: {
        ...baseConfig.output,
        filename: `${library}.js`,
      },
      optimization: {
        ...baseConfig.optimization,
        minimize: false,
      },
    },
    // Minified version
    {
      ...baseConfig,
      mode: 'production',
      output: {
        ...baseConfig.output,
        filename: `${library}.min.js`,
      },
      optimization: {
        ...baseConfig.optimization,
        minimize: true,
      },
    },
  );
};

// Main
addModule('./src/v1/index.mjs', 'TinyEssentials');
addModule('./src/v1/basics/index.mjs', 'TinyBasicsEs');
addModule('./src/v1/build/TinyLevelUp.mjs', 'TinyLevelUp', true);
addModule('./src/v1/build/TinyPromiseQueue.mjs', 'TinyPromiseQueue', true);
addModule('./src/v1/build/ColorSafeStringify.mjs', 'ColorSafeStringify', true);
addModule('./src/v1/build/TinyRateLimiter.mjs', 'TinyRateLimiter', true);

export default modules;
