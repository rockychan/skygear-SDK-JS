'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _http = require('http');

var _http2 = _interopRequireDefault(_http);

var _registry = require('../registry');

var _registry2 = _interopRequireDefault(_registry);

var _settings = require('../settings');

var _error = require('../../error');

var _common = require('./common');

var _common2 = _interopRequireDefault(_common);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; } /**
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                * Copyright 2015 Oursky Ltd.
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                *
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                * Licensed under the Apache License, Version 2.0 (the "License");
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                * you may not use this file except in compliance with the License.
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                * You may obtain a copy of the License at
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                *
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                *     http://www.apache.org/licenses/LICENSE-2.0
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                *
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                * Unless required by applicable law or agreed to in writing, software
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                * distributed under the License is distributed on an "AS IS" BASIS,
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                * See the License for the specific language governing permissions and
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                * limitations under the License.
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                */


var HTTPTransport = function (_CommonTransport) {
  _inherits(HTTPTransport, _CommonTransport);

  function HTTPTransport(reg) {
    _classCallCheck(this, HTTPTransport);

    var _this = _possibleConstructorReturn(this, (HTTPTransport.__proto__ || Object.getPrototypeOf(HTTPTransport)).call(this, reg));

    _this.registry = reg;
    _this.dispatch = _this.dispatch.bind(_this);
    _this.readReq = _this.readReq.bind(_this);
    _this.server = null;
    return _this;
  }

  _createClass(HTTPTransport, [{
    key: 'start',
    value: function start() {
      if (this.server !== null) {
        throw new Error('HTTPTransport can only start once.');
      }
      this.server = _http2.default.createServer(this.readReq);
      this.server.on('clientError', function (err, socket) {
        socket.end('HTTP/1.1 400 Bad Request\r\n\r\n');
      });
      this.server.on('error', function (err, socket) {
        socket.end('HTTP/1.1 500 Internal Server Error\r\n\r\n');
      });

      var _settings$http = _settings.settings.http;
      var address = _settings$http.address;
      var port = _settings$http.port;


      console.info('Listening ' + address + ' on port ' + port + '...');
      this.server.listen(port, address);
    }
  }, {
    key: 'close',
    value: function close() {
      this.server.close();
      this.server = null;
    }
  }, {
    key: 'readReq',
    value: function readReq(req, res) {
      var _this2 = this;

      req.setEncoding('utf8');
      var body = '';
      req.on('data', function (chunk) {
        body += chunk.toString();
      });
      req.on('end', function () {
        var data = JSON.parse(body);
        try {
          _this2.dispatch(data, res);
        } catch (e) {
          res.writeHead(500, {
            'Content-Type': 'application/json'
          });
          res.write('Internal server error\r\n' + e);
          res.end();
          console.warn(e.stack);
          return;
        }
      });
    }
  }, {
    key: 'dispatch',
    value: function dispatch(payload, res) {
      var _this3 = this;

      var handlerName = payload.kind + 'Handler';
      if (!this[handlerName]) {
        res.writeHead(400, {
          'Content-Type': 'application/json'
        });
        console.log('func kind ' + payload.kind + ' is not supported');
        res.write('func kind ' + payload.kind + ' is not supported');
        res.end();
        return;
      }

      this[handlerName](payload).then(function (resolved) {
        _this3.writeResponse(res, resolved);
      }).catch(function (err) {
        if (err instanceof _error.SkygearError) {
          // do nothing
        } else if (err !== null && err !== undefined) {
          console.error('Catching unexpected error:', err);
          err = new _error.SkygearError(err.toString());
        } else {
          console.error('Catching err but value is null or undefined.');
          err = new _error.SkygearError('An unexpected error has occurred.');
        }
        _this3.writeResponse(res, {
          error: err.toJSON()
        });
      });
    }
  }, {
    key: 'writeResponse',
    value: function writeResponse(res, result) {
      res.writeHead(200, {
        'Content-Type': 'application/json'
      });
      res.write(JSON.stringify(result));
      res.end();
    }
  }]);

  return HTTPTransport;
}(_common2.default);

var transport = new HTTPTransport(_registry2.default);

exports.default = transport;
module.exports = exports['default'];