import path from 'path';
import { fileURLToPath } from 'url';
import webpack from 'webpack';
import NodePolyfillPlugin from 'node-polyfill-webpack-plugin';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Add modules
const modules = [];
const addModule = (version, entry, library, isClass = false) => {
  const baseConfig = {
    entry,
    output: {
      path: path.resolve(__dirname, `dist/v${version}`),
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
addModule(1, './src/v1/index.mjs', 'TinyEssentials');
addModule(1, './src/v1/basics/index.mjs', 'TinyBasicsEs');
addModule(1, './src/v1/build/TinyLevelUp.mjs', 'TinyLevelUp', true);
addModule(1, './src/v1/build/TinyPromiseQueue.mjs', 'TinyPromiseQueue', true);
addModule(1, './src/v1/build/ColorSafeStringify.mjs', 'ColorSafeStringify', true);
addModule(1, './src/v1/build/TinyRateLimiter.mjs', 'TinyRateLimiter', true);
addModule(1, './src/v1/build/TinyNotifyCenter.mjs', 'TinyNotifyCenter', true);
addModule(1, './src/v1/build/TinyToastNotify.mjs', 'TinyToastNotify', true);
addModule(1, './src/v1/build/TinyDragDropDetector.mjs', 'TinyDragDropDetector', true);
addModule(1, './src/v1/build/TinyUploadClicker.mjs', 'TinyUploadClicker', true);
addModule(1, './src/v1/build/TinyDomReadyManager.mjs', 'TinyDomReadyManager', true);
addModule(1, './src/v1/build/TinyDragger.mjs', 'TinyDragger', true);

export default modules;
