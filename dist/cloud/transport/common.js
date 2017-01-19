'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.SkygearResponse = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }(); /**
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


var _Base = require('Base64');

var _stream = require('stream');

var _stream2 = _interopRequireDefault(_stream);

var _formidable = require('formidable');

var _url = require('url');

var _pg = require('../pg');

var _record2 = require('../../record');

var _record3 = _interopRequireDefault(_record2);

var _skyconfig = require('../skyconfig');

var _skyconfig2 = _interopRequireDefault(_skyconfig);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/**
 * Encode 16-bit unicode strings or a buffer to base64 string.
 *
 * @see https://developer.mozilla.org/en-US/docs/Web/API/WindowBase64/Base64_encoding_and_decoding#The_Unicode_Problem
 */
function b64EncodeUnicode(data) {
  // If the data is a buffer, use its base64 encoding instead of using
  // our unicode to base64 encoding.
  if (data instanceof Buffer) {
    return data.toString('base64');
  }

  return (0, _Base.btoa)(encodeURIComponent(data).replace(/%([0-9A-F]{2})/g, function (match, p1) {
    return String.fromCharCode('0x' + p1);
  }));
}

/**
 * Decode 16-bit unicode strings from base64 string.
 *
 * @see https://developer.mozilla.org/en-US/docs/Web/API/WindowBase64/Base64_encoding_and_decoding#The_Unicode_Problem
 */
function b64DecodeUnicode(str) {
  return decodeURIComponent(Array.prototype.map.call((0, _Base.atob)(str), function (c) {
    return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
  }).join(''));
}

/**
 * This is thin request object trying to provide a http.IncomingMessage like
 * object for access http request properties.
 */

var SkygearRequest = function () {
  function SkygearRequest(param) {
    _classCallCheck(this, SkygearRequest);

    this.headers = param.header;
    this.method = param.method;
    this.path = param.path;
    this.queryString = param.query_string;
    this.body = b64DecodeUnicode(param.body);
    if (this.queryString) {
      this.url = (0, _url.parse)(this.path + '?' + this.queryString, true);
    } else {
      this.url = (0, _url.parse)('' + this.path, true);
    }
  }

  _createClass(SkygearRequest, [{
    key: 'form',
    value: function form(callback) {
      var req = new _stream2.default.PassThrough();
      req.headers = {
        'content-type': this.headers['Content-Type'][0],
        'content-length': this.headers['Content-Length'][0]
      };
      req.end(this.body);
      var f = new _formidable.IncomingForm();
      return f.parse(req, callback);
    }
  }, {
    key: 'query',
    get: function get() {
      return this.url.query;
    }
  }, {
    key: 'json',
    get: function get() {
      return JSON.parse(this.body);
    }
  }]);

  return SkygearRequest;
}();

/**
 * This is thin response object trying to provide a http.ServerResponse like
 * interface for setting response headers and body.
 */


var SkygearResponse = exports.SkygearResponse = function () {
  function SkygearResponse(options) {
    _classCallCheck(this, SkygearResponse);

    this.statusCode = options.statusCode || 200;
    this.headers = options.headers || {};
    this.body = options.body || '';
  }

  _createClass(SkygearResponse, [{
    key: 'setHeader',
    value: function setHeader(name, value) {
      this.headers[name] = value;
    }
  }, {
    key: 'getHeader',
    value: function getHeader(name) {
      return this.headers[name];
    }
  }, {
    key: 'removeHeader',
    value: function removeHeader(name) {
      delete this.headers[name];
    }
  }, {
    key: 'write',
    value: function write(chunk) {
      this.body += chunk;
    }
  }]);

  return SkygearResponse;
}();

var CommonTransport = function () {
  function CommonTransport(registry) {
    _classCallCheck(this, CommonTransport);

    this.registry = registry;
    this._registerInitEvent = this._registerInitEvent.bind(this);

    this.registry.registerEvent('init', this._registerInitEvent);
  }

  _createClass(CommonTransport, [{
    key: '_registerInitEvent',
    value: function _registerInitEvent(param) {
      var config = param.config || {};
      Object.keys(config).forEach(function (perKey) {
        _skyconfig2.default[perKey] = config[perKey];
      });

      return this.registry.funcList();
    }
  }, {
    key: 'start',
    value: function start() {
      throw new Error('Not implemented');
    }
  }, {
    key: '_promisify',
    value: function _promisify(func) {
      try {
        for (var _len = arguments.length, param = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
          param[_key - 1] = arguments[_key];
        }

        var result = func.apply(undefined, param);
        if (result instanceof Promise) {
          return result;
        }
        return Promise.resolve(result);
      } catch (err) {
        return Promise.reject(err);
      }
    }
  }, {
    key: 'initHandler',
    value: function initHandler() {
      return Promise.reject(new Error('Init trigger is deprecated, use init event instead'));
    }
  }, {
    key: 'hookHandler',
    value: function hookHandler(payload) {
      var name = payload.name;
      var param = payload.param;
      var context = payload.context;


      var func = this.registry.getFunc('hook', name);
      var _type = this.registry.getHookType(name);
      if (!func) {
        return Promise.reject(new Error('Database hook does not exist'));
      }

      var incomingRecord = new _record3.default(_type, param.record);
      var originalRecord = null;
      if (param.original) {
        originalRecord = new _record3.default(_type, param.original);
      }

      var options = { context: context };
      return this._promisify(func, incomingRecord, originalRecord, _pg.pool, options).then(function (_record) {
        var record = _record || incomingRecord;
        return {
          result: record.toJSON()
        };
      });
    }
  }, {
    key: 'opHandler',
    value: function opHandler(payload) {
      var name = payload.name;
      var param = payload.param;
      var context = payload.context;


      var func = this.registry.getFunc('op', name);
      if (!func) {
        return Promise.reject(new Error('Lambda function does not exist'));
      }

      var options = { context: context };
      return this._promisify(func, param, options).then(function (result) {
        return { result: result };
      });
    }
  }, {
    key: 'eventHandler',
    value: function eventHandler(payload) {
      var _this = this;

      var funcList = this.registry.getEventFunctions(payload.name);

      if (!funcList) {
        // It is okay that the sending event has no handlers
        return Promise.resolve({
          result: []
        });
      }

      var funcPromises = funcList.map(function (eachFunc) {
        return _this._promisify(eachFunc, payload.param);
      });

      return Promise.all(funcPromises).then(function (results) {
        var result = results.length > 1 ? results : results[0];
        return { result: result };
      });
    }
  }, {
    key: 'timerHandler',
    value: function timerHandler(payload) {
      var func = this.registry.getFunc('timer', payload.name);
      if (!func) {
        return Promise.reject(new Error('Cronjob not exist'));
      }

      return this._promisify(func, payload.param).then(function (result) {
        return { result: result };
      });
    }
  }, {
    key: 'handlerHandler',
    value: function handlerHandler(payload) {
      var name = payload.name;
      var param = payload.param;
      var context = payload.context;


      var func = this.registry.getHandler(name, param.method);
      if (!func) {
        return Promise.reject(new Error('Handler not exist'));
      }

      var options = { context: context };
      var req = new SkygearRequest(param);
      return this._promisify(func, req, options).then(function (result) {
        var headers = {};
        var body = void 0;
        var statusCode = 200;
        if (result instanceof SkygearResponse) {
          statusCode = result.statusCode;
          Object.keys(result.headers).forEach(function (perKey) {
            headers[perKey] = result.headers[perKey];
          });
          body = b64EncodeUnicode(result.body);
        } else if (typeof result === 'string') {
          headers['Content-Type'] = ['text/plain; charset=utf-8'];
          body = b64EncodeUnicode(result);
        } else {
          headers['Content-Type'] = ['application/json'];
          body = b64EncodeUnicode(JSON.stringify(result));
        }

        return {
          result: {
            status: statusCode,
            header: headers,
            body: body
          }
        };
      });
    }
  }, {
    key: 'providerHandler',
    value: function providerHandler(payload) {
      var name = payload.name;
      var param = payload.param;


      var provider = this.registry.getProvider(name);
      if (!provider) {
        return Promise.reject(new Error('Provider not exist'));
      }

      return this._promisify(provider.handleAction, param.action, param).then(function (result) {
        return { result: result };
      });
    }
  }]);

  return CommonTransport;
}();

exports.default = CommonTransport;