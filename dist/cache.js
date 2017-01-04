'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

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


var _store = require('./store');

var _store2 = _interopRequireDefault(_store);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Cache = function () {
  function Cache(prefix) {
    _classCallCheck(this, Cache);

    this._maxRetryCount = 1;
    this.prefix = prefix;
    this.map = {};
    this.store = _store2.default;
  }

  _createClass(Cache, [{
    key: '_applyNamespaceOnKey',
    value: function _applyNamespaceOnKey(key) {
      return this.prefix + ':' + key;
    }
  }, {
    key: 'set',
    value: function set(key, value) {
      var namespacedKey = this._applyNamespaceOnKey(key);
      this.map[namespacedKey] = value;
      var stringifiedValue = JSON.stringify(value);
      return this._setWithRetry(namespacedKey, stringifiedValue);
    }
  }, {
    key: '_setWithRetry',
    value: function _setWithRetry(namespacedKey, stringifiedValue) {
      var attempt = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 0;

      return this.store.setPurgeableItem(namespacedKey, stringifiedValue).catch(function (error) {
        // base case
        if (attempt >= this._maxRetryCount) {
          return Promise.reject(error);
        }
        // recursive case
        // It seems that there is no easy way to
        // convert an asynchronous recursion into
        // iterative style with for-loop.
        return this._setWithRetry(namespacedKey, stringifiedValue, attempt + 1);
      }.bind(this));
    }
  }, {
    key: 'get',
    value: function get(key) {
      var namespacedKey = this._applyNamespaceOnKey(key);
      if (this.map[namespacedKey]) {
        return Promise.resolve(this.map[namespacedKey]);
      }
      return this.store.getItem(namespacedKey).then(function (jsonStr) {
        if (jsonStr) {
          var cachedJSON = JSON.parse(jsonStr);
          return cachedJSON;
        }
        return Promise.reject();
      });
    }
  }]);

  return Cache;
}();

exports.default = Cache;
module.exports = exports['default'];