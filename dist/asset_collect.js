'use strict';

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _ncp = require('ncp');

var _child_process = require('child_process');

var _settings = require('./cloud/settings');

var _registry = require('./cloud/registry');

var _registry2 = _interopRequireDefault(_registry);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var cmd = 'index.js';
if (process.argv.length > 2) {
  cmd = process.argv[2];
}

if (cmd === '--help') {
  process.stdout.write('\n  Usage: skygear-asset <file>\n\n  file will default to index.js if not provided.\n  For configuration, please see skygear-node. Which provided details.\n  ');

  process.exit();
}

var codePath = _path2.default.join(process.cwd(), cmd);
require(codePath);

if (_fs2.default.existsSync(_settings.settings.collectAsset)) {
  if (!_settings.settings.forceAsset) {
    process.stdout.write('Directory \'' + _settings.settings.collectAsset + '\' already exists.\nRemove the directory first, or specify FORCE_ASSET to discard files\nin the directory.\n');
    process.exit();
  }
  (0, _child_process.execSync)('rm -r ' + _settings.settings.collectAsset);
  console.log('Cleaned up ' + _settings.settings.collectAsset);
}

_fs2.default.mkdirSync(_settings.settings.collectAsset);

Object.keys(_registry2.default.staticAsset).forEach(function (key) {
  var src = _registry2.default.staticAsset[key]();
  var dest = _path2.default.join(_settings.settings.collectAsset, key);
  console.log('Copying ' + src + ' into ' + dest);
  (0, _ncp.ncp)(src, dest, function (err) {
    if (err) {
      return console.error(err);
    }
    console.log('Copied ' + src + ' into ' + dest);
  });
});