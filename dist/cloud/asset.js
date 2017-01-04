'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.staticAssetHandler = staticAssetHandler;

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _mimeTypes = require('mime-types');

var _mimeTypes2 = _interopRequireDefault(_mimeTypes);

var _common = require('./transport/common');

var _registry = require('./registry');

var _registry2 = _interopRequireDefault(_registry);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * staticAssetHandler — default handler for serving static assets with during
 * development.
 *
 * @param {string} recordType - The type of the record.
 * @param {function(record: lib/record.js~Record, originalRecord: lib/record.js~Record, pool: pool): *} func - function to be registered.
 * @param {object} [options] - options for hook: async
 */

function staticAssetHandler(req) {
  if (req.path.indexOf('/static') !== 0) {
    throw new Error('The base path is not static asset');
  }
  var matchedPrefix = null;
  Object.keys(_registry2.default.staticAsset).forEach(function (prefix) {
    if (req.path.indexOf('/static' + prefix) === 0) {
      matchedPrefix = prefix;
    }
  });
  if (!matchedPrefix) {
    return new _common.SkygearResponse({
      statusCode: 404
    });
  }
  var matchedFunc = _registry2.default.staticAsset[matchedPrefix];
  var absPrefix = matchedFunc();
  var finalPath = req.path.replace('/static' + matchedPrefix, absPrefix);
  if (!_fs2.default.existsSync(finalPath)) {
    return new _common.SkygearResponse({
      statusCode: 404
    });
  }
  var data = _fs2.default.readFileSync(finalPath, {
    flag: 'r'
  });
  var contentType = _mimeTypes2.default.contentType(_path2.default.extname(finalPath));
  return new _common.SkygearResponse({
    headers: {
      'Content-Type': [contentType]
    },
    body: data
  });
}