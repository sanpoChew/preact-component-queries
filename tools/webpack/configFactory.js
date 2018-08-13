import { resolve as resolvePath } from 'path'
import webpack from 'webpack'
import appRootDir from 'app-root-dir'
import LodashModuleReplacementPlugin from 'lodash-webpack-plugin'
import { getPackageJson, removeEmpty, ifElse } from '../utils'

function webpackConfigFactory({ target }) {
  const libraryName = getPackageJson().name
  const minimize = target === 'umd-min'
  const env = process.env.NODE_ENV

  return {
    entry: {
      index: resolvePath(appRootDir.get(), './src/react/index.js'),
    },
    output: {
      path: resolvePath(appRootDir.get(), './umd'),
      filename:
        target === 'umd' ? `${libraryName}.js` : `${libraryName}.min.js`,
      library: libraryName,
      libraryTarget: 'umd',
    },
    externals: {
      react: {
        root: 'preact',
        amd: 'preact',
        commonjs: 'preact',
        commonjs2: 'preact',
      },
      'prop-types': {
        root: 'PropTypes',
        amd: 'prop-types',
        commonjs: 'prop-types',
        commonjs2: 'prop-types',
      },
      'preact-sizeme': {
        root: 'SizeMe',
        commonjs2: 'preact-sizeme',
        commonjs: 'preact-sizeme',
        amd: 'preact-sizeme',
      },
    },
    plugins: removeEmpty([
      new webpack.DefinePlugin({
        'process.env.NODE_ENV': JSON.stringify('production'),
      }),

      new webpack.LoaderOptionsPlugin({
        minimize,
      }),

      ifElse(minimize)(
        new webpack.optimize.UglifyJsPlugin({
          compress: {
            screw_ie8: true,
            warnings: false,
          },
          mangle: {
            screw_ie8: true,
          },
          output: {
            comments: false,
            screw_ie8: true,
          },
        }),
      ),
      ifElse(env === 'production')(new LodashModuleReplacementPlugin()),
    ]),
    module: {
      rules: [
        {
          test: /\.js$/,
          loader: 'babel-loader',
          include: [resolvePath(appRootDir.get(), './src')],
        },
      ],
    },
  }
}

module.exports = webpackConfigFactory
