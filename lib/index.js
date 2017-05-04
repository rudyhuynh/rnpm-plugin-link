/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// identity function for calling harmony imports with the correct context
/******/ 	__webpack_require__.i = function(value) { return value; };
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, {
/******/ 				configurable: false,
/******/ 				enumerable: true,
/******/ 				get: getter
/******/ 			});
/******/ 		}
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 36);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports) {

module.exports = require("lodash");

/***/ }),
/* 1 */
/***/ (function(module, exports) {

module.exports = require("path");

/***/ }),
/* 2 */
/***/ (function(module, exports) {

module.exports = require("fs");

/***/ }),
/* 3 */
/***/ (function(module, exports) {

module.exports = require("npmlog");

/***/ }),
/* 4 */
/***/ (function(module, exports) {

const getFirstProject = project => project.getFirstProject().firstProject;

const findGroup = (group, name) => group.children.find(group => group.comment === name);

/**
 * Returns group from .xcodeproj if one exists, null otherwise
 *
 * Unlike node-xcode `pbxGroupByName` - it does not return `first-matching`
 * group if multiple groups with the same name exist
 *
 * If path is not provided, it returns top-level group
 */
module.exports = function getGroup(project, path) {
  const firstProject = getFirstProject(project);

  var group = project.getPBXGroupByKey(firstProject.mainGroup);

  if (!path) {
    return group;
  }

  for (var name of path.split('/')) {
    var foundGroup = findGroup(group, name);

    if (foundGroup) {
      group = project.getPBXGroupByKey(foundGroup.value);
    } else {
      group = null;
      break;
    }
  }

  return group;
};

/***/ }),
/* 5 */
/***/ (function(module, exports) {

module.exports = require("xcode");

/***/ }),
/* 6 */
/***/ (function(module, exports, __webpack_require__) {

const groupBy = __webpack_require__(0).groupBy;
const mime = __webpack_require__(74);

/**
 * Since there are no officially registered MIME types
 * for ttf/otf yet http://www.iana.org/assignments/media-types/media-types.xhtml,
 * we define two non-standard ones for the sake of parsing
 */
mime.define({
  'font/opentype': ['otf'],
  'font/truetype': ['ttf']
});

/**
 * Given an array of files, it groups it by it's type.
 * Type of the file is inferred from it's mimetype based on the extension
 * file ends up with. The returned value is an object with properties that
 * correspond to the first part of the mimetype, e.g. images will be grouped
 * under `image` key since the mimetype for them is `image/jpg` etc.
 *
 * Example:
 * Given an array ['fonts/a.ttf', 'images/b.jpg'],
 * the returned object will be: {font: ['fonts/a.ttf'], image: ['images/b.jpg']}
 */
module.exports = function groupFilesByType(assets) {
  return groupBy(assets, type => mime.lookup(type).split('/')[0]);
};

/***/ }),
/* 7 */
/***/ (function(module, exports) {

module.exports = require("fs-extra");

/***/ }),
/* 8 */
/***/ (function(module, exports) {

module.exports = function makeBuildPatch(name) {
  return {
    pattern: /[^ \t]dependencies {\n/,
    patch: `    compile project(':${name}')\n`
  };
};

/***/ }),
/* 9 */
/***/ (function(module, exports, __webpack_require__) {

const log = __webpack_require__(3);

const createGroup = __webpack_require__(49);
const getGroup = __webpack_require__(4);

/**
 * Given project and path of the group, it checks if a group exists at that path,
 * and deeply creates a group for that path if its does not already exist.
 *
 * Returns the existing or newly created group
 */
module.exports = function createGroupWithMessage(project, path) {
  var group = getGroup(project, path);

  if (!group) {
    group = createGroup(project, path);

    log.warn('ERRGROUP', `Group '${path}' does not exist in your Xcode project. We have created it automatically for you.`);
  }

  return group;
};

/***/ }),
/* 10 */
/***/ (function(module, exports, __webpack_require__) {

const path = __webpack_require__(1);
const getBuildProperty = __webpack_require__(50);

module.exports = function getPlistPath(project, sourceDir) {
  const plistFile = getBuildProperty(project, 'INFOPLIST_FILE');

  if (!plistFile) {
    return null;
  }

  return path.join(sourceDir, plistFile.replace(/"/g, '').replace('$(SRCROOT)', ''));
};

/***/ }),
/* 11 */
/***/ (function(module, exports) {

module.exports = function makeUsingPatch(packageImportPath) {
  return {
    pattern: 'using ReactNative.Modules.Core;',
    patch: '\n' + packageImportPath
  };
};

/***/ }),
/* 12 */
/***/ (function(module, exports) {

module.exports = require("plist");

/***/ }),
/* 13 */
/***/ (function(module, exports) {

module.exports = require("xcode/lib/pbxFile");

/***/ }),
/* 14 */
/***/ (function(module, exports, __webpack_require__) {

const fs = __webpack_require__(2);
const makeBuildPatch = __webpack_require__(8);

module.exports = function isInstalled(config, name) {
  return fs.readFileSync(config.buildGradlePath).indexOf(makeBuildPatch(name).patch) > -1;
};

/***/ }),
/* 15 */
/***/ (function(module, exports) {

module.exports = function makeImportPatch(packageImportPath) {
  return {
    pattern: 'import com.facebook.react.ReactApplication;',
    patch: '\n' + packageImportPath
  };
};

/***/ }),
/* 16 */
/***/ (function(module, exports, __webpack_require__) {

const applyParams = __webpack_require__(38);

module.exports = function makePackagePatch(packageInstance, params, prefix) {
  const processedInstance = applyParams(packageInstance, params, prefix);

  return {
    pattern: 'new MainReactPackage()',
    patch: ',\n            ' + processedInstance
  };
};

/***/ }),
/* 17 */
/***/ (function(module, exports, __webpack_require__) {

const path = __webpack_require__(1);
const isWin = process.platform === 'win32';

module.exports = function makeSettingsPatch(name, androidConfig, projectConfig) {
  var projectDir = path.relative(path.dirname(projectConfig.settingsGradlePath), androidConfig.sourceDir);

  /*
   * Fix for Windows
   * Backslashes is the escape character and will result in
   * an invalid path in settings.gradle
   * https://github.com/rnpm/rnpm/issues/113
   */
  if (isWin) {
    projectDir = projectDir.replace(/\\/g, '/');
  }

  return {
    pattern: '\n',
    patch: `include ':${name}'\n` + `project(':${name}').projectDir = ` + `new File(rootProject.projectDir, '${projectDir}')\n`
  };
};

/***/ }),
/* 18 */
/***/ (function(module, exports, __webpack_require__) {

const toCamelCase = __webpack_require__(0).camelCase;

module.exports = function makeStringsPatch(params, prefix) {
  const values = Object.keys(params).map(param => {
    const name = toCamelCase(prefix) + '_' + param;
    return '    ' + `<string moduleConfig="true" name="${name}">${params[param]}</string>`;
  });

  const patch = values.length > 0 ? values.join('\n') + '\n' : '';

  return {
    pattern: '<resources>\n',
    patch
  };
};

/***/ }),
/* 19 */
/***/ (function(module, exports) {

module.exports = cb => cb();

/***/ }),
/* 20 */
/***/ (function(module, exports) {

/**
 * Given an array of dependencies - it returns their RNPM config
 * if they were valid.
 */
module.exports = function getDependencyConfig(config, deps) {
  return deps.reduce((acc, name) => {
    try {
      return acc.concat({
        config: config.getDependencyConfig(name),
        name
      });
    } catch (err) {
      console.log(err);
      return acc;
    }
  }, []);
};

/***/ }),
/* 21 */
/***/ (function(module, exports, __webpack_require__) {

const path = __webpack_require__(1);

/**
 * Returns an array of dependencies that should be linked/checked.
 */
module.exports = function getProjectDependencies() {
  const pjson = !(function webpackMissingModule() { var e = new Error("Cannot find module \".\""); e.code = 'MODULE_NOT_FOUND'; throw e; }());
  return Object.keys(pjson.dependencies || {}).filter(name => name !== 'react-native');
};

/***/ }),
/* 22 */
/***/ (function(module, exports, __webpack_require__) {

const path = __webpack_require__(1);
const union = __webpack_require__(0).union;
const last = __webpack_require__(0).last;

/**
 * Given an array of directories, it returns the one that contains
 * all the other directories in a given array inside it.
 *
 * Example:
 * Given an array of directories: ['/Users/Kureev/a', '/Users/Kureev/b']
 * the returned folder is `/Users/Kureev`
 *
 * Check `getHeaderSearchPath.spec.js` for more use-cases.
 */
const getOuterDirectory = directories => directories.reduce((topDir, currentDir) => {
  const currentFolders = currentDir.split(path.sep);
  const topMostFolders = topDir.split(path.sep);

  if (currentFolders.length === topMostFolders.length && last(currentFolders) !== last(topMostFolders)) {
    return currentFolders.slice(0, -1).join(path.sep);
  }

  return currentFolders.length < topMostFolders.length ? currentDir : topDir;
});

/**
 * Given an array of headers it returns search path so Xcode can resolve
 * headers when referenced like below:
 * ```
 * #import "CodePush.h"
 * ```
 * If all files are located in one directory (directories.length === 1),
 * we simply return a relative path to that location.
 *
 * Otherwise, we loop through them all to find the outer one that contains
 * all the headers inside. That location is then returned with /** appended at
 * the end so Xcode marks that location as `recursive` and will look inside
 * every folder of it to locate correct headers.
 */
module.exports = function getHeaderSearchPath(sourceDir, headers) {
  const directories = union(headers.map(path.dirname));

  return directories.length === 1 ? `"$(SRCROOT)${path.sep}${path.relative(sourceDir, directories[0])}"` : `"$(SRCROOT)${path.sep}${path.relative(sourceDir, getOuterDirectory(directories))}/**"`;
};

/***/ }),
/* 23 */
/***/ (function(module, exports, __webpack_require__) {

const glob = __webpack_require__(72);
const path = __webpack_require__(1);

const GLOB_EXCLUDE_PATTERN = ['node_modules/**', 'Pods/**', 'Examples/**', 'examples/**'];

/**
 * Given folder, it returns an array of all header files
 * inside it, ignoring node_modules and examples
 */
module.exports = function getHeadersInFolder(folder) {
  return glob.sync('**/*.h', {
    cwd: folder,
    nodir: true,
    ignore: GLOB_EXCLUDE_PATTERN
  }).map(file => path.join(folder, file));
};

/***/ }),
/* 24 */
/***/ (function(module, exports, __webpack_require__) {

const plistParser = __webpack_require__(12);
const getPlistPath = __webpack_require__(10);
const fs = __webpack_require__(2);

/**
 * Returns Info.plist located in the iOS project
 *
 * Returns `null` if INFOPLIST_FILE is not specified.
 */
module.exports = function getPlist(project, sourceDir) {
  const plistPath = getPlistPath(project, sourceDir);

  if (!plistPath || !fs.existsSync(plistPath)) {
    return null;
  }

  return plistParser.parse(fs.readFileSync(plistPath, 'utf-8'));
};

/***/ }),
/* 25 */
/***/ (function(module, exports) {

/**
 * Given xcodeproj it returns list of products ending with
 * .a extension, so that we know what elements add to target
 * project static library
 */
module.exports = function getProducts(project) {
  return project.pbxGroupByName('Products').children.map(c => c.comment).filter(c => c.indexOf('.a') > -1);
};

/***/ }),
/* 26 */
/***/ (function(module, exports, __webpack_require__) {

const xcode = __webpack_require__(5);
const getGroup = __webpack_require__(4);
const hasLibraryImported = __webpack_require__(51);

/**
 * Returns true if `xcodeproj` specified by dependencyConfig is present
 * in a top level `libraryFolder`
 */
module.exports = function isInstalled(projectConfig, dependencyConfig) {
  const project = xcode.project(projectConfig.pbxprojPath).parseSync();
  const libraries = getGroup(project, projectConfig.libraryFolder);

  if (!libraries) {
    return false;
  }

  return hasLibraryImported(libraries, dependencyConfig.projectName);
};

/***/ }),
/* 27 */
/***/ (function(module, exports) {

/**
 * Given Xcode project and path, iterate over all build configurations
 * and execute func with HEADER_SEARCH_PATHS from current section
 *
 * We cannot use builtin addToHeaderSearchPaths method since react-native init does not
 * use $(TARGET_NAME) for PRODUCT_NAME, but sets it manually so that method will skip
 * that target.
 *
 * To workaround that issue and make it more bullet-proof for different names,
 * we iterate over all configurations and look for `lc++` linker flag to detect
 * React Native target.
 *
 * Important: That function mutates `buildSettings` and it's not pure thus you should
 * not rely on its return value
 */
const defaultHeaderPaths = ['"$(inherited)"'];

module.exports = function headerSearchPathIter(project, func) {
  const config = project.pbxXCBuildConfigurationSection();

  Object.keys(config).filter(ref => ref.indexOf('_comment') === -1).forEach(ref => {
    const buildSettings = config[ref].buildSettings;
    const shouldVisitBuildSettings = (Array.isArray(buildSettings.OTHER_LDFLAGS) ? buildSettings.OTHER_LDFLAGS : []).indexOf('"-lc++"') >= 0;

    if (shouldVisitBuildSettings) {
      buildSettings.HEADER_SEARCH_PATHS = func(buildSettings.HEADER_SEARCH_PATHS || defaultHeaderPaths);
    }
  });
};

/***/ }),
/* 28 */
/***/ (function(module, exports) {

/**
 * Given an array of promise creators, executes them in a sequence.
 *
 * If any of the promises in the chain fails, all subsequent promises
 * will be skipped
 *
 * Returns the value last promise from a sequence resolved
 */
module.exports = function promiseWaterfall(tasks) {
  return tasks.reduce((prevTaskPromise, task) => prevTaskPromise.then(task), Promise.resolve());
};

/***/ }),
/* 29 */
/***/ (function(module, exports) {

module.exports = func => new Promise((resolve, reject) => func((err, res) => err ? reject(err) : resolve(res)));

/***/ }),
/* 30 */
/***/ (function(module, exports, __webpack_require__) {

const fs = __webpack_require__(2);
const makeUsingPatch = __webpack_require__(11);

module.exports = function isInstalled(config, dependencyConfig) {
  return fs.readFileSync(config.mainPage).indexOf(makeUsingPatch(dependencyConfig.packageUsingPath).patch) > -1;
};

/***/ }),
/* 31 */
/***/ (function(module, exports, __webpack_require__) {

const applyParams = __webpack_require__(65);

module.exports = function makePackagePatch(packageInstance, params, prefix) {
  const processedInstance = applyParams(packageInstance, params, prefix);

  return {
    pattern: 'new MainReactPackage()',
    patch: ',\n                    ' + processedInstance
  };
};

/***/ }),
/* 32 */
/***/ (function(module, exports) {

module.exports = function makeProjectPatch(windowsConfig) {

  const projectInsert = `<ProjectReference Include="..\\${windowsConfig.relativeProjPath}">
      <Project>{${windowsConfig.pathGUID}}</Project>
      <Name>${windowsConfig.projectName}</Name>
    </ProjectReference>
    `;

  return {
    pattern: '<ProjectReference Include="..\\..\\node_modules\\react-native-windows\\ReactWindows\\ReactNative\\ReactNative.csproj">',
    patch: projectInsert,
    unpatch: new RegExp(`<ProjectReference.+\\s+.+\\s+.+${windowsConfig.projectName}.+\\s+.+\\s`)
  };
};

/***/ }),
/* 33 */
/***/ (function(module, exports) {

module.exports = function makeSolutionPatch(windowsConfig) {

  const solutionInsert = `Project("{${windowsConfig.projectGUID.toUpperCase()}}") = "${windowsConfig.projectName}", "${windowsConfig.relativeProjPath}", "{${windowsConfig.pathGUID.toUpperCase()}}"
EndProject
`;

  return {
    pattern: 'Global',
    patch: solutionInsert,
    unpatch: new RegExp(`Project.+${windowsConfig.projectName}.+\\s+EndProject\\s+`)
  };
};

/***/ }),
/* 34 */
/***/ (function(module, exports, __webpack_require__) {

/**
 * Copyright (c) 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * 
 */

const log = __webpack_require__(3);
const path = __webpack_require__(1);
const uniq = __webpack_require__(0).uniq;
const flatten = __webpack_require__(0).flatten;
const chalk = __webpack_require__(71);

const isEmpty = __webpack_require__(0).isEmpty;
const promiseWaterfall = __webpack_require__(28);
const registerDependencyAndroid = __webpack_require__(41);
const registerDependencyWindows = __webpack_require__(68);
const registerDependencyIOS = __webpack_require__(52);
const isInstalledAndroid = __webpack_require__(14);
const isInstalledWindows = __webpack_require__(30);
const isInstalledIOS = __webpack_require__(26);
const copyAssetsAndroid = __webpack_require__(37);
const copyAssetsIOS = __webpack_require__(48);
const getProjectDependencies = __webpack_require__(21);
const getDependencyConfig = __webpack_require__(20);
const pollParams = __webpack_require__(64);
const commandStub = __webpack_require__(19);
const promisify = __webpack_require__(29);

log.heading = 'rnpm-link';

const dedupeAssets = assets => uniq(assets, asset => path.basename(asset));

const linkDependencyAndroid = (androidProject, dependency) => {
  if (!androidProject || !dependency.config.android) {
    return null;
  }

  const isInstalled = isInstalledAndroid(androidProject, dependency.name);

  if (isInstalled) {
    log.info(chalk.grey(`Android module ${dependency.name} is already linked`));
    return null;
  }

  return pollParams(dependency.config.params).then(params => {
    log.info(`Linking ${dependency.name} android dependency`);

    registerDependencyAndroid(dependency.name, dependency.config.android, params, androidProject);

    log.info(`Android module ${dependency.name} has been successfully linked`);
  });
};

const linkDependencyWindows = (windowsProject, dependency) => {

  if (!windowsProject || !dependency.config.windows) {
    return null;
  }

  const isInstalled = isInstalledWindows(windowsProject, dependency.config.windows);

  if (isInstalled) {
    log.info(chalk.grey(`Windows module ${dependency.name} is already linked`));
    return null;
  }

  return pollParams(dependency.config.params).then(params => {
    log.info(`Linking ${dependency.name} windows dependency`);

    registerDependencyWindows(dependency.name, dependency.config.windows, params, windowsProject);

    log.info(`Windows module ${dependency.name} has been successfully linked`);
  });
};

const linkDependencyIOS = (iOSProject, dependency) => {
  if (!iOSProject || !dependency.config.ios) {
    return;
  }

  const isInstalled = isInstalledIOS(iOSProject, dependency.config.ios);

  if (isInstalled) {
    log.info(chalk.grey(`iOS module ${dependency.name} is already linked`));
    return;
  }

  log.info(`Linking ${dependency.name} ios dependency`);

  registerDependencyIOS(dependency.config.ios, iOSProject);

  log.info(`iOS module ${dependency.name} has been successfully linked`);
};

const linkAssets = (project, assets) => {
  if (isEmpty(assets)) {
    return;
  }

  if (project.ios) {
    log.info('Linking assets to ios project');
    copyAssetsIOS(assets, project.ios);
  }

  if (project.android) {
    log.info('Linking assets to android project');
    copyAssetsAndroid(assets, project.android.assetsPath);
  }

  log.info('Assets have been successfully linked to your project');
};

/**
 * Updates project and links all dependencies to it.
 *
 * @param args If optional argument [packageName] is provided,
 *             only that package is processed.
 * @param config CLI config, see local-cli/core/index.js
 */
function link(args, config) {
  var project;
  try {
    project = config.getProjectConfig();
  } catch (err) {
    log.error('ERRPACKAGEJSON', 'No package found. Are you sure this is a React Native project?');
    return Promise.reject(err);
  }

  let packageName = args[0];
  // Check if install package by specific version (eg. package@latest)
  if (packageName !== undefined) {
    packageName = packageName.split('@')[0];
  }

  const dependencies = getDependencyConfig(config, packageName ? [packageName] : getProjectDependencies());

  const assets = dedupeAssets(dependencies.reduce((assets, dependency) => assets.concat(dependency.config.assets), project.assets));

  const tasks = flatten(dependencies.map(dependency => [() => promisify(dependency.config.commands.prelink || commandStub), () => linkDependencyAndroid(project.android, dependency), () => linkDependencyIOS(project.ios, dependency), () => linkDependencyWindows(project.windows, dependency), () => promisify(dependency.config.commands.postlink || commandStub)]));

  tasks.push(() => linkAssets(project, assets));

  return promiseWaterfall(tasks).catch(err => {
    log.error(`Something went wrong while linking. Error: ${err.message} \n` + 'Please file an issue here: https://github.com/facebook/react-native/issues');
    throw err;
  });
}

module.exports = {
  func: link,
  description: 'links all native dependencies (updates native build files)',
  name: 'link [packageName]'
};

/***/ }),
/* 35 */
/***/ (function(module, exports, __webpack_require__) {

const log = __webpack_require__(3);

const getProjectDependencies = __webpack_require__(21);
const unregisterDependencyAndroid = __webpack_require__(43);
const unregisterDependencyWindows = __webpack_require__(69);
const unregisterDependencyIOS = __webpack_require__(63);
const isInstalledAndroid = __webpack_require__(14);
const isInstalledWindows = __webpack_require__(30);
const isInstalledIOS = __webpack_require__(26);
const unlinkAssetsAndroid = __webpack_require__(42);
const unlinkAssetsIOS = __webpack_require__(62);
const getDependencyConfig = __webpack_require__(20);
const compact = __webpack_require__(0).compact;
const difference = __webpack_require__(0).difference;
const filter = __webpack_require__(0).filter;
const find = __webpack_require__(0).find;
const flatten = __webpack_require__(0).flatten;
const isEmpty = __webpack_require__(0).isEmpty;
const promiseWaterfall = __webpack_require__(28);
const commandStub = __webpack_require__(19);
const promisify = __webpack_require__(29);

log.heading = 'rnpm-link';

const unlinkDependencyAndroid = (androidProject, dependency, packageName) => {
  if (!androidProject || !dependency.android) {
    return;
  }

  const isInstalled = isInstalledAndroid(androidProject, packageName);

  if (!isInstalled) {
    log.info(`Android module ${packageName} is not installed`);
    return;
  }

  log.info(`Unlinking ${packageName} android dependency`);

  unregisterDependencyAndroid(packageName, dependency.android, androidProject);

  log.info(`Android module ${packageName} has been successfully unlinked`);
};

const unlinkDependencyWindows = (windowsProject, dependency, packageName) => {
  if (!windowsProject || !dependency.windows) {
    return;
  }

  const isInstalled = isInstalledWindows(windowsProject, dependency.windows);

  if (!isInstalled) {
    log.info(`Windows module ${packageName} is not installed`);
    return;
  }

  log.info(`Unlinking ${packageName} windows dependency`);

  unregisterDependencyWindows(packageName, dependency.windows, windowsProject);

  log.info(`Windows module ${packageName} has been successfully unlinked`);
};

const unlinkDependencyIOS = (iOSProject, dependency, packageName, iOSDependencies) => {
  if (!iOSProject || !dependency.ios) {
    return;
  }

  const isInstalled = isInstalledIOS(iOSProject, dependency.ios);

  if (!isInstalled) {
    log.info(`iOS module ${packageName} is not installed`);
    return;
  }

  log.info(`Unlinking ${packageName} ios dependency`);

  unregisterDependencyIOS(dependency.ios, iOSProject, iOSDependencies);

  log.info(`iOS module ${packageName} has been successfully unlinked`);
};

/**
 * Updates project and unlink specific dependency
 *
 * If optional argument [packageName] is provided, it's the only one
 * that's checked
 */
function unlink(args, config) {
  const packageName = args[0];

  var project;
  var dependency;

  try {
    project = config.getProjectConfig();
  } catch (err) {
    log.error('ERRPACKAGEJSON', 'No package found. Are you sure it\'s a React Native project?');
    return Promise.reject(err);
  }

  try {
    dependency = config.getDependencyConfig(packageName);
  } catch (err) {
    log.warn('ERRINVALIDPROJ', `Project ${packageName} is not a react-native library`);
    return Promise.reject(err);
  }

  const allDependencies = getDependencyConfig(config, getProjectDependencies());
  const otherDependencies = filter(allDependencies, d => d.name !== packageName);
  const iOSDependencies = compact(otherDependencies.map(d => d.config.ios));

  const tasks = [() => promisify(dependency.commands.preunlink || commandStub), () => unlinkDependencyAndroid(project.android, dependency, packageName), () => unlinkDependencyIOS(project.ios, dependency, packageName, iOSDependencies), () => unlinkDependencyWindows(project.windows, dependency, packageName), () => promisify(dependency.commands.postunlink || commandStub)];

  return promiseWaterfall(tasks).then(() => {
    // @todo move all these to `tasks` array, just like in
    // link
    const assets = difference(dependency.assets, flatten(allDependencies, d => d.assets));

    if (isEmpty(assets)) {
      return Promise.resolve();
    }

    if (project.ios) {
      log.info('Unlinking assets from ios project');
      unlinkAssetsIOS(assets, project.ios);
    }

    if (project.android) {
      log.info('Unlinking assets from android project');
      unlinkAssetsAndroid(assets, project.android.assetsPath);
    }

    log.info(`${packageName} assets has been successfully unlinked from your project`);
  }).catch(err => {
    log.error(`It seems something went wrong while unlinking. Error: ${err.message}`);
    throw err;
  });
};

module.exports = {
  func: unlink,
  description: 'unlink native dependency',
  name: 'unlink <packageName>'
};

/***/ }),
/* 36 */
/***/ (function(module, exports, __webpack_require__) {

module.exports = [{
  func: __webpack_require__(34),
  description: 'Links images',
  name: 'link-images [packageName]'
}, {
  func: __webpack_require__(35),
  description: 'Unlink images',
  name: 'unlink-images <packageName>'
}];

// abc def

/***/ }),
/* 37 */
/***/ (function(module, exports, __webpack_require__) {

const fs = __webpack_require__(7);
const path = __webpack_require__(1);
const groupFilesByType = __webpack_require__(6);

/**
 * Copies each file from an array of assets provided to targetPath directory
 *
 * For now, the only types of files that are handled are:
 * - Fonts (otf, ttf) - copied to targetPath/fonts under original name
 */
module.exports = function copyAssetsAndroid(files, targetPath) {
  const assets = groupFilesByType(files);

  (assets.font || []).forEach(asset => fs.copySync(asset, path.join(targetPath, 'fonts', path.basename(asset))));
};

/***/ }),
/* 38 */
/***/ (function(module, exports, __webpack_require__) {

/**
 * Copyright (c) 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 */

const toCamelCase = __webpack_require__(0).camelCase;

module.exports = function applyParams(str, params, prefix) {
  return str.replace(/\$\{(\w+)\}/g, (pattern, param) => {
    const name = toCamelCase(prefix) + '_' + param;

    return params[param] ? `getResources().getString(R.string.${name})` : null;
  });
};

/***/ }),
/* 39 */
/***/ (function(module, exports, __webpack_require__) {

const fs = __webpack_require__(2);

module.exports = function applyPatch(file, patch) {
  fs.writeFileSync(file, fs.readFileSync(file, 'utf8').replace(patch.pattern, match => `${match}${patch.patch}`));
};

/***/ }),
/* 40 */
/***/ (function(module, exports, __webpack_require__) {

const fs = __webpack_require__(2);

module.exports = function revokePatch(file, patch) {
  fs.writeFileSync(file, fs.readFileSync(file, 'utf8').replace(patch.patch, ''));
};

/***/ }),
/* 41 */
/***/ (function(module, exports, __webpack_require__) {

const applyPatch = __webpack_require__(39);
const makeStringsPatch = __webpack_require__(18);
const makeSettingsPatch = __webpack_require__(17);
const makeBuildPatch = __webpack_require__(8);
const makeImportPatch = __webpack_require__(15);
const makePackagePatch = __webpack_require__(16);

module.exports = function registerNativeAndroidModule(name, androidConfig, params, projectConfig) {
  const buildPatch = makeBuildPatch(name);

  applyPatch(projectConfig.settingsGradlePath, makeSettingsPatch(name, androidConfig, projectConfig));

  applyPatch(projectConfig.buildGradlePath, buildPatch);
  applyPatch(projectConfig.stringsPath, makeStringsPatch(params, name));

  applyPatch(projectConfig.mainFilePath, makePackagePatch(androidConfig.packageInstance, params, name));

  applyPatch(projectConfig.mainFilePath, makeImportPatch(androidConfig.packageImportPath));
};

/***/ }),
/* 42 */
/***/ (function(module, exports, __webpack_require__) {

const fs = __webpack_require__(7);
const path = __webpack_require__(1);
const groupFilesByType = __webpack_require__(6);

/**
 * Copies each file from an array of assets provided to targetPath directory
 *
 * For now, the only types of files that are handled are:
 * - Fonts (otf, ttf) - copied to targetPath/fonts under original name
 */
module.exports = function unlinkAssetsAndroid(files, targetPath) {
  const grouped = groupFilesByType(files);

  grouped.font.forEach(file => {
    const filename = path.basename(file);
    if (fs.existsSync(filename)) {
      fs.unlinkSync(path.join(targetPath, 'fonts', filename));
    }
  });
};

/***/ }),
/* 43 */
/***/ (function(module, exports, __webpack_require__) {

const fs = __webpack_require__(2);
const toCamelCase = __webpack_require__(0).camelCase;

const revokePatch = __webpack_require__(40);
const makeSettingsPatch = __webpack_require__(17);
const makeBuildPatch = __webpack_require__(8);
const makeStringsPatch = __webpack_require__(18);
const makeImportPatch = __webpack_require__(15);
const makePackagePatch = __webpack_require__(16);

module.exports = function unregisterNativeAndroidModule(name, androidConfig, projectConfig) {
  const buildPatch = makeBuildPatch(name);
  const strings = fs.readFileSync(projectConfig.stringsPath, 'utf8');
  var params = {};

  strings.replace(/moduleConfig="true" name="(\w+)">(.*)</g, (_, param, value) => {
    params[param.slice(toCamelCase(name).length + 1)] = value;
  });

  revokePatch(projectConfig.settingsGradlePath, makeSettingsPatch(name, androidConfig, projectConfig));

  revokePatch(projectConfig.buildGradlePath, buildPatch);
  revokePatch(projectConfig.stringsPath, makeStringsPatch(params, name));

  revokePatch(projectConfig.mainFilePath, makePackagePatch(androidConfig.packageInstance, params, name));

  revokePatch(projectConfig.mainFilePath, makeImportPatch(androidConfig.packageImportPath));
};

/***/ }),
/* 44 */
/***/ (function(module, exports, __webpack_require__) {

const PbxFile = __webpack_require__(13);

/**
 * Given xcodeproj and filePath, it creates new file
 * from path provided, adds it to the project
 * and returns newly created instance of a file
 */
module.exports = function addFileToProject(project, filePath) {
  const file = new PbxFile(filePath);
  file.uuid = project.generateUuid();
  file.fileRef = project.generateUuid();
  project.addToPbxFileReferenceSection(file);
  return file;
};

/***/ }),
/* 45 */
/***/ (function(module, exports) {

/**
 * Given an array of xcodeproj libraries and pbxFile,
 * it appends it to that group
 *
 * Important: That function mutates `libraries` and it's not pure.
 * It's mainly due to limitations of `xcode` library.
 */
module.exports = function addProjectToLibraries(libraries, file) {
  return libraries.children.push({
    value: file.fileRef,
    comment: file.basename
  });
};

/***/ }),
/* 46 */
/***/ (function(module, exports, __webpack_require__) {

const createGroupWithMessage = __webpack_require__(9);

module.exports = function addSharedLibraries(project, libraries) {
  if (!libraries.length) {
    return;
  }

  // Create a Frameworks group if necessary.
  createGroupWithMessage(project, 'Frameworks');

  const target = project.getFirstTarget().uuid;

  for (var name of libraries) {
    project.addFramework(name, { target });
  }
};

/***/ }),
/* 47 */
/***/ (function(module, exports, __webpack_require__) {

const mapHeaderSearchPaths = __webpack_require__(27);

module.exports = function addToHeaderSearchPaths(project, path) {
  mapHeaderSearchPaths(project, searchPaths => searchPaths.concat(path));
};

/***/ }),
/* 48 */
/***/ (function(module, exports, __webpack_require__) {

const fs = __webpack_require__(7);
const path = __webpack_require__(1);
const xcode = __webpack_require__(5);
const log = __webpack_require__(3);
const plistParser = __webpack_require__(12);
const groupFilesByType = __webpack_require__(6);
const createGroupWithMessage = __webpack_require__(9);
const getPlist = __webpack_require__(24);
const getPlistPath = __webpack_require__(10);

/**
 * This function works in a similar manner to its Android version,
 * except it does not copy fonts but creates Xcode Group references
 */
module.exports = function linkAssetsIOS(files, projectConfig) {
  const project = xcode.project(projectConfig.pbxprojPath).parseSync();
  const assets = groupFilesByType(files);
  const plist = getPlist(project, projectConfig.sourceDir);

  createGroupWithMessage(project, 'Resources');

  const fonts = (assets.font || []).map(asset => project.addResourceFile(path.relative(projectConfig.sourceDir, asset), { target: project.getFirstTarget().uuid })).filter(file => file) // xcode returns false if file is already there
  .map(file => file.basename);

  const existingFonts = plist.UIAppFonts || [];
  const allFonts = [...existingFonts, ...fonts];
  plist.UIAppFonts = Array.from(new Set(allFonts)); // use Set to dedupe w/existing

  fs.writeFileSync(projectConfig.pbxprojPath, project.writeSync());

  fs.writeFileSync(getPlistPath(project, projectConfig.sourceDir), plistParser.build(plist));
};

/***/ }),
/* 49 */
/***/ (function(module, exports, __webpack_require__) {

const getGroup = __webpack_require__(4);

const hasGroup = (pbxGroup, name) => pbxGroup.children.find(group => group.comment === name);

/**
 * Given project and path of the group, it deeply creates a given group
 * making all outer groups if neccessary
 *
 * Returns newly created group
 */
module.exports = function createGroup(project, path) {
  return path.split('/').reduce((group, name) => {
    if (!hasGroup(group, name)) {
      const uuid = project.pbxCreateGroup(name, '""');

      group.children.push({
        value: uuid,
        comment: name
      });
    }

    return project.pbxGroupByName(name);
  }, getGroup(project));
};

/***/ }),
/* 50 */
/***/ (function(module, exports) {

/**
 * Gets build property from the main target build section
 *
 * It differs from the project.getBuildProperty exposed by xcode in the way that:
 * - it only checks for build property in the main target `Debug` section
 * - `xcode` library iterates over all build sections and because it misses
 * an early return when property is found, it will return undefined/wrong value
 * when there's another build section typically after the one you want to access
 * without the property defined (e.g. CocoaPods sections appended to project
 * miss INFOPLIST_FILE), see: https://github.com/alunny/node-xcode/blob/master/lib/pbxProject.js#L1765
 */
module.exports = function getBuildProperty(project, prop) {
  const target = project.getFirstTarget().firstTarget;
  const config = project.pbxXCConfigurationList()[target.buildConfigurationList];
  const buildSection = project.pbxXCBuildConfigurationSection()[config.buildConfigurations[0].value];

  return buildSection.buildSettings[prop];
};

/***/ }),
/* 51 */
/***/ (function(module, exports) {

/**
 * Given an array of libraries already imported and packageName that will be
 * added, returns true or false depending on whether the library is already linked
 * or not
 */
module.exports = function hasLibraryImported(libraries, packageName) {
  return libraries.children.filter(library => library.comment === packageName).length > 0;
};

/***/ }),
/* 52 */
/***/ (function(module, exports, __webpack_require__) {

const xcode = __webpack_require__(5);
const fs = __webpack_require__(2);
const path = __webpack_require__(1);
const log = __webpack_require__(3);

const addToHeaderSearchPaths = __webpack_require__(47);
const getHeadersInFolder = __webpack_require__(23);
const getHeaderSearchPath = __webpack_require__(22);
const getProducts = __webpack_require__(25);
const createGroupWithMessage = __webpack_require__(9);
const addFileToProject = __webpack_require__(44);
const addProjectToLibraries = __webpack_require__(45);
const addSharedLibraries = __webpack_require__(46);
const isEmpty = __webpack_require__(0).isEmpty;
const getGroup = __webpack_require__(4);

/**
 * Register native module IOS adds given dependency to project by adding
 * its xcodeproj to project libraries as well as attaching static library
 * to the first target (the main one)
 *
 * If library is already linked, this action is a no-op.
 */
module.exports = function registerNativeModuleIOS(dependencyConfig, projectConfig) {
  const project = xcode.project(projectConfig.pbxprojPath).parseSync();
  const dependencyProject = xcode.project(dependencyConfig.pbxprojPath).parseSync();

  const libraries = createGroupWithMessage(project, projectConfig.libraryFolder);
  const file = addFileToProject(project, path.relative(projectConfig.sourceDir, dependencyConfig.projectPath));

  addProjectToLibraries(libraries, file);

  getProducts(dependencyProject).forEach(product => {
    project.addStaticLibrary(product, {
      target: project.getFirstTarget().uuid
    });
  });

  addSharedLibraries(project, dependencyConfig.sharedLibraries);

  const headers = getHeadersInFolder(dependencyConfig.folder);
  if (!isEmpty(headers)) {
    addToHeaderSearchPaths(project, getHeaderSearchPath(projectConfig.sourceDir, headers));
  }

  fs.writeFileSync(projectConfig.pbxprojPath, project.writeSync());
};

/***/ }),
/* 53 */
/***/ (function(module, exports, __webpack_require__) {

const mapHeaderSearchPaths = __webpack_require__(27);

/**
 * Given Xcode project and absolute path, it makes sure there are no headers referring to it
 */
module.exports = function addToHeaderSearchPaths(project, path) {
  mapHeaderSearchPaths(project, searchPaths => searchPaths.filter(searchPath => searchPath !== path));
};

/***/ }),
/* 54 */
/***/ (function(module, exports) {

/**
 * For all files that are created and referenced from another `.xcodeproj` -
 * a new PBXItemContainerProxy is created that contains `containerPortal` value
 * which equals to xcodeproj file.uuid from PBXFileReference section.
 */
module.exports = function removeFromPbxItemContainerProxySection(project, file) {
  const section = project.hash.project.objects.PBXContainerItemProxy;

  for (var key of Object.keys(section)) {
    if (section[key].containerPortal === file.uuid) {
      delete section[key];
    }
  }

  return;
};

/***/ }),
/* 55 */
/***/ (function(module, exports) {

/**
 * Every file added to the project from another project is attached to
 * `PBXItemContainerProxy` through `PBXReferenceProxy`.
 */
module.exports = function removeFromPbxReferenceProxySection(project, file) {
  const section = project.hash.project.objects.PBXReferenceProxy;

  for (var key of Object.keys(section)) {
    if (section[key].path === file.basename) {
      delete section[key];
    }
  }

  return;
};

/***/ }),
/* 56 */
/***/ (function(module, exports) {

/**
 * For each file (.xcodeproj), there's an entry in `projectReferences` created
 * that has two entries - `ProjectRef` - reference to a file.uuid and
 * `ProductGroup` - uuid of a Products group.
 *
 * When projectReference is found - it's deleted and the removed value is returned
 * so that ProductGroup in PBXGroup section can be removed as well.
 *
 * Otherwise returns null
 */
module.exports = function removeFromProjectReferences(project, file) {
  const firstProject = project.getFirstProject().firstProject;

  const projectRef = firstProject.projectReferences.find(item => item.ProjectRef === file.uuid);

  if (!projectRef) {
    return null;
  }

  firstProject.projectReferences.splice(firstProject.projectReferences.indexOf(projectRef), 1);

  return projectRef;
};

/***/ }),
/* 57 */
/***/ (function(module, exports, __webpack_require__) {

const PbxFile = __webpack_require__(13);
const removeFromPbxReferenceProxySection = __webpack_require__(55);

/**
 * Removes file from static libraries
 *
 * Similar to `node-xcode` addStaticLibrary
 */
module.exports = function removeFromStaticLibraries(project, path, opts) {
  const file = new PbxFile(path);

  file.target = opts ? opts.target : undefined;

  project.removeFromPbxFileReferenceSection(file);
  project.removeFromPbxBuildFileSection(file);
  project.removeFromPbxFrameworksBuildPhase(file);
  project.removeFromLibrarySearchPaths(file);
  removeFromPbxReferenceProxySection(project, file);

  return file;
};

/***/ }),
/* 58 */
/***/ (function(module, exports) {

module.exports = function removeProductGroup(project, productGroupId) {
  const section = project.hash.project.objects.PBXGroup;

  for (var key of Object.keys(section)) {
    if (key === productGroupId) {
      delete section[key];
    }
  }

  return;
};

/***/ }),
/* 59 */
/***/ (function(module, exports) {

/**
 * Given an array of xcodeproj libraries and pbxFile,
 * it removes it from that group by comparing basenames
 *
 * Important: That function mutates `libraries` and it's not pure.
 * It's mainly due to limitations of `xcode` library.
 */
module.exports = function removeProjectFromLibraries(libraries, file) {
  libraries.children = libraries.children.filter(library => library.comment !== file.basename);
};

/***/ }),
/* 60 */
/***/ (function(module, exports, __webpack_require__) {

const PbxFile = __webpack_require__(13);
const removeFromPbxItemContainerProxySection = __webpack_require__(54);
const removeFromProjectReferences = __webpack_require__(56);
const removeProductGroup = __webpack_require__(58);

/**
 * Given xcodeproj and filePath, it creates new file
 * from path provided and removes it. That operation is required since
 * underlying method requires PbxFile instance to be passed (it does not
 * have to have uuid or fileRef defined since it will do equality check
 * by path)
 *
 * Returns removed file (that one will have UUID)
 */
module.exports = function removeProjectFromProject(project, filePath) {
  const file = project.removeFromPbxFileReferenceSection(new PbxFile(filePath));
  const projectRef = removeFromProjectReferences(project, file);

  if (projectRef) {
    removeProductGroup(project, projectRef.ProductGroup);
  }

  removeFromPbxItemContainerProxySection(project, file);

  return file;
};

/***/ }),
/* 61 */
/***/ (function(module, exports) {

module.exports = function removeSharedLibraries(project, libraries) {
  if (!libraries.length) {
    return;
  }

  const target = project.getFirstTarget().uuid;

  for (var name of libraries) {
    project.removeFramework(name, { target });
  }
};

/***/ }),
/* 62 */
/***/ (function(module, exports, __webpack_require__) {

const fs = __webpack_require__(7);
const path = __webpack_require__(1);
const xcode = __webpack_require__(5);
const log = __webpack_require__(3);
const plistParser = __webpack_require__(12);
const groupFilesByType = __webpack_require__(6);
const getPlist = __webpack_require__(24);
const getPlistPath = __webpack_require__(10);
const difference = __webpack_require__(0).difference;

/**
 * Unlinks assets from iOS project. Removes references for fonts from `Info.plist`
 * fonts provided by application and from `Resources` group
 */
module.exports = function unlinkAssetsIOS(files, projectConfig) {
  const project = xcode.project(projectConfig.pbxprojPath).parseSync();
  const assets = groupFilesByType(files);
  const plist = getPlist(project, projectConfig.sourceDir);

  if (!plist) {
    return log.error('ERRPLIST', `Could not locate Info.plist file. Check if your project has 'INFOPLIST_FILE' set properly`);
  }

  if (!project.pbxGroupByName('Resources')) {
    return log.error('ERRGROUP', `Group 'Resources' does not exist in your Xcode project. There is nothing to unlink.`);
  }

  const fonts = (assets.font || []).map(asset => project.removeResourceFile(path.relative(projectConfig.sourceDir, asset), { target: project.getFirstTarget().uuid })).map(file => file.basename);

  plist.UIAppFonts = difference(plist.UIAppFonts || [], fonts);

  fs.writeFileSync(projectConfig.pbxprojPath, project.writeSync());

  fs.writeFileSync(getPlistPath(project, projectConfig.sourceDir), plistParser.build(plist));
};

/***/ }),
/* 63 */
/***/ (function(module, exports, __webpack_require__) {

const xcode = __webpack_require__(5);
const path = __webpack_require__(1);
const fs = __webpack_require__(2);
const difference = __webpack_require__(0).difference;
const isEmpty = __webpack_require__(0).isEmpty;

const getGroup = __webpack_require__(4);
const getProducts = __webpack_require__(25);
const getHeadersInFolder = __webpack_require__(23);
const getHeaderSearchPath = __webpack_require__(22);
const removeProjectFromProject = __webpack_require__(60);
const removeProjectFromLibraries = __webpack_require__(59);
const removeFromStaticLibraries = __webpack_require__(57);
const removeFromHeaderSearchPaths = __webpack_require__(53);
const removeSharedLibraries = __webpack_require__(61);

/**
 * Unregister native module IOS
 *
 * If library is already unlinked, this action is a no-op.
 */
module.exports = function unregisterNativeModule(dependencyConfig, projectConfig, iOSDependencies) {
  const project = xcode.project(projectConfig.pbxprojPath).parseSync();
  const dependencyProject = xcode.project(dependencyConfig.pbxprojPath).parseSync();

  const libraries = getGroup(project, projectConfig.libraryFolder);

  const file = removeProjectFromProject(project, path.relative(projectConfig.sourceDir, dependencyConfig.projectPath));

  removeProjectFromLibraries(libraries, file);

  getProducts(dependencyProject).forEach(product => {
    removeFromStaticLibraries(project, product, {
      target: project.getFirstTarget().uuid
    });
  });

  const sharedLibraries = difference(dependencyConfig.sharedLibraries, iOSDependencies.reduce((libs, dependency) => libs.concat(dependency.sharedLibraries), projectConfig.sharedLibraries));

  removeSharedLibraries(project, sharedLibraries);

  const headers = getHeadersInFolder(dependencyConfig.folder);
  if (!isEmpty(headers)) {
    removeFromHeaderSearchPaths(project, getHeaderSearchPath(projectConfig.sourceDir, headers));
  }

  fs.writeFileSync(projectConfig.pbxprojPath, project.writeSync());
};

/***/ }),
/* 64 */
/***/ (function(module, exports, __webpack_require__) {

var inquirer = __webpack_require__(73);

module.exports = questions => new Promise((resolve, reject) => {
  if (!questions) {
    return resolve({});
  }

  inquirer.prompt(questions, resolve);
});

/***/ }),
/* 65 */
/***/ (function(module, exports, __webpack_require__) {

/**
 * Copyright (c) 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 */

const toCamelCase = __webpack_require__(0).camelCase;

module.exports = function applyParams(str, params, prefix) {
  return str.replace(/\$\{(\w+)\}/g, (pattern, param) => {
    const name = toCamelCase(prefix) + '_' + param;

    return params[param] ? `getResources().getString(R.string.${name})` : null;
  });
};

/***/ }),
/* 66 */
/***/ (function(module, exports, __webpack_require__) {

const fs = __webpack_require__(2);

module.exports = function applyPatch(file, patch, flip = false) {

  fs.writeFileSync(file, fs.readFileSync(file, 'utf8').replace(patch.pattern, match => {
    return flip ? `${patch.patch}${match}` : `${match}${patch.patch}`;
  }));
};

/***/ }),
/* 67 */
/***/ (function(module, exports, __webpack_require__) {

const fs = __webpack_require__(2);

module.exports = function revokePatch(file, patch) {
  const unpatch = patch.unpatch || patch.patch;
  fs.writeFileSync(file, fs.readFileSync(file, 'utf8').replace(unpatch, ''));
};

/***/ }),
/* 68 */
/***/ (function(module, exports, __webpack_require__) {

const applyPatch = __webpack_require__(66);

const makeProjectPatch = __webpack_require__(32);
const makeSolutionPatch = __webpack_require__(33);
const makeUsingPatch = __webpack_require__(11);
const makePackagePatch = __webpack_require__(31);

module.exports = function registerNativeWindowsModule(name, windowsConfig, params, projectConfig) {
  applyPatch(projectConfig.projectPath, makeProjectPatch(windowsConfig), true);
  applyPatch(projectConfig.solutionPath, makeSolutionPatch(windowsConfig), true);

  applyPatch(projectConfig.mainPage, makePackagePatch(windowsConfig.packageInstance, params, name));

  applyPatch(projectConfig.mainPage, makeUsingPatch(windowsConfig.packageUsingPath));
};

/***/ }),
/* 69 */
/***/ (function(module, exports, __webpack_require__) {

const fs = __webpack_require__(2);
const toCamelCase = __webpack_require__(0).camelCase;

const revokePatch = __webpack_require__(67);
const makeProjectPatch = __webpack_require__(32);
const makeSolutionPatch = __webpack_require__(33);
const makeUsingPatch = __webpack_require__(11);
const makePackagePatch = __webpack_require__(31);

module.exports = function unregisterNativeWindowsModule(name, windowsConfig, projectConfig) {
  revokePatch(projectConfig.projectPath, makeProjectPatch(windowsConfig));
  revokePatch(projectConfig.solutionPath, makeSolutionPatch(windowsConfig));

  revokePatch(projectConfig.mainPage, makePackagePatch(windowsConfig.packageInstance, {}, name));

  revokePatch(projectConfig.mainPage, makeUsingPatch(windowsConfig.packageUsingPath));
};

/***/ }),
/* 70 */
/***/ (function(module, exports) {

function webpackEmptyContext(req) {
	throw new Error("Cannot find module '" + req + "'.");
}
webpackEmptyContext.keys = function() { return []; };
webpackEmptyContext.resolve = webpackEmptyContext;
module.exports = webpackEmptyContext;
webpackEmptyContext.id = 70;

/***/ }),
/* 71 */
/***/ (function(module, exports) {

module.exports = require("chalk");

/***/ }),
/* 72 */
/***/ (function(module, exports) {

module.exports = require("glob");

/***/ }),
/* 73 */
/***/ (function(module, exports) {

module.exports = require("inquirer");

/***/ }),
/* 74 */
/***/ (function(module, exports) {

module.exports = require("mime");

/***/ })
/******/ ]);