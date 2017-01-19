'use strict';

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _settings = require('./cloud/settings');

var _registry = require('./cloud/registry');

var _registry2 = _interopRequireDefault(_registry);

var _asset = require('./cloud/asset');

var _cloud = require('./cloud');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var cmd = 'index.js';
if (process.argv.length > 2) {
  cmd = process.argv[2];
}

if (cmd === '--help') {
  process.stdout.write('\n  Usage: skygear-node <file>\n\n  file will default to index.js if not provided.\n\n  skygear-node are configured by ENVVAR:\n  - SKYGEAR_ADDRESS: Binds to this socket for skygear\n  - SKYGEAR_ENDPOINT: Send to this address for skygear handlers\n  - API_KEY: API Key of the application\n  - MASTER_KEY: Master Key of the application\n  - APP_NAME: Application name of the skygear daemon\n  - LOG_LEVEL: Log level\n  - HTTP: Trigger http web server\n  - HTTP_ADDR: Address where htp web server listen to\n  - DEBUG: Enable debugging features\n  - SERVE_STATIC_ASSETS: Enable to serve static asset from plugin process\n  - PUBSUB_URL: The URL of the pubsub server, should start with ws://\n    or wss:// and include the path\n  - LOAD_MODULES: List of comma separated modules to load\n  ');

  process.exit();
}

if (cmd === '--settings') {
  console.log(_settings.settings);
  process.exit();
}

_settings.settings.loadModules.forEach(function (moduleName) {
  (0, _cloud.configModule)(moduleName);
});

var codePath = _path2.default.join(process.cwd(), cmd);
(0, _cloud.configModule)(codePath, {
  ignoreWarning: true
});

// Register the static asset as handler if configured so
if (_settings.settings.serveStaticAssets) {
  _registry2.default.registerHandler('static/', _asset.staticAssetHandler, {
    authRequired: false,
    userRequired: false
  });
}

// Boot the transport
var transport = void 0;
if (_settings.settings.http.enabled) {
  transport = require('./cloud/transport/http');
} else {
  throw new Error('Currently, only http transport is supported.');
}

transport.start();