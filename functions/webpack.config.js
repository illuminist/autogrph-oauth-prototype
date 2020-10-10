const path = require('path')

var fs = require('fs')
// var path = require('path');
var utils = {}

utils.contains = function contains(arr, val) {
  return arr && arr.indexOf(val) !== -1
}

var atPrefix = new RegExp('^@', 'g')
utils.readDir = function readDir(dirName) {
  if (dirName instanceof Array) {
    return dirName.reduce((acc, opt) => acc.concat(readDir(opt)), [])
  }

  if (!fs.existsSync(dirName)) {
    return []
  }

  try {
    return fs
      .readdirSync(dirName)
      .map(function (moduleName) {
        if (atPrefix.test(moduleName)) {
          // reset regexp
          atPrefix.lastIndex = 0
          try {
            return fs
              .readdirSync(path.join(dirName, moduleName))
              .map(function (scopedMod) {
                return moduleName + '/' + scopedMod
              })
          } catch (e) {
            return [moduleName]
          }
        }
        return moduleName
      })
      .reduce(function (prev, next) {
        return prev.concat(next)
      }, [])
  } catch (e) {
    return []
  }
}

utils.readFromPackageJson = function readFromPackageJson(options) {
  if (options instanceof Array) {
    return options.reduce(
      (acc, opt) => acc.concat(readFromPackageJson(opt)),
      [],
    )
  }

  if (typeof options !== 'object') {
    options = {}
  }
  // read the file
  var packageJson
  try {
    var fileName = options.fileName || 'package.json'
    var packageJsonString = fs.readFileSync(
      path.join(process.cwd(), './' + fileName),
      'utf8',
    )
    packageJson = JSON.parse(packageJsonString)
  } catch (e) {
    return []
  }
  // sections to search in package.json
  var sections = [
    'dependencies',
    'devDependencies',
    'peerDependencies',
    'optionalDependencies',
  ]
  if (options.include) {
    sections = [].concat(options.include)
  }
  if (options.exclude) {
    sections = sections.filter(function (section) {
      return [].concat(options.exclude).indexOf(section) === -1
    })
  }
  // collect dependencies
  var deps = {}
  sections.forEach(function (section) {
    Object.keys(packageJson[section] || {}).forEach(function (dep) {
      deps[dep] = true
    })
  })
  return Object.keys(deps)
}

utils.containsPattern = function containsPattern(arr, val) {
  return (
    arr &&
    arr.some(function (pattern) {
      if (pattern instanceof RegExp) {
        return pattern.test(val)
      } else if (typeof pattern === 'function') {
        return pattern(val)
      } else {
        return pattern == val
      }
    })
  )
}

var scopedModuleRegex = new RegExp(
  '@[a-zA-Z0-9][\\w-.]+/[a-zA-Z0-9][\\w-.]+([a-zA-Z0-9./]+)?',
  'g',
)

function getModuleName(request, includeAbsolutePaths) {
  var req = request
  var delimiter = '/'

  if (includeAbsolutePaths) {
    req = req.replace(/^.*?\/node_modules\//, '')
  }
  // check if scoped module
  if (scopedModuleRegex.test(req)) {
    // reset regexp
    scopedModuleRegex.lastIndex = 0
    return req.split(delimiter, 2).join(delimiter)
  }
  return req.split(delimiter)[0]
}

function nodeExternals(options) {
  options = options || {}
  var whitelist = [].concat(options.whitelist || [])
  var binaryDirs = [].concat(options.binaryDirs || ['.bin'])
  var importType = options.importType || 'commonjs'
  var modulesDir = options.modulesDir || 'node_modules'
  var modulesFromFile = !!options.modulesFromFile
  var includeAbsolutePaths = !!options.includeAbsolutePaths

  // helper function
  function isNotBinary(x) {
    return !utils.contains(binaryDirs, x)
  }

  // create the node modules list
  var nodeModules = modulesFromFile
    ? utils.readFromPackageJson(options.modulesFromFile)
    : utils.readDir(modulesDir).filter(isNotBinary)

  // return an externals function
  return function (context, request, callback) {
    var moduleName = getModuleName(request, includeAbsolutePaths)
    if (
      utils.contains(nodeModules, moduleName) &&
      !utils.containsPattern(whitelist, request)
    ) {
      if (typeof importType === 'function') {
        return callback(null, importType(request))
      }
      // mark this module as external
      // https://webpack.js.org/configuration/externals/
      return callback(null, importType + ' ' + request)
    }
    callback()
  }
}

module.exports = {
  entry: './src/index.ts',
  output: {
    filename: 'index.js',
    libraryTarget: 'commonjs2',
    path: path.resolve(__dirname, 'dist'),
  },

  mode: 'development',

  target: 'node',

  devtool: 'eval-source-map',

  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: 'babel-loader',
        exclude: /node_modules/,
      },
      {
        test: /\.txt$/i,
        use: 'raw-loader',
      },
    ],
  },

  resolve: {
    extensions: ['.tsx', '.ts', '.js'],
  },

  externals: [
    nodeExternals({
      // modulesFromFile: [
      //   { fileName: 'package.json' },
      //   { fileName: '../game/package.json' },
      // ],
      modulesDir: [
        path.resolve('node_modules'),
        path.resolve('../node_modules'),
      ],
    }),
  ],
}
