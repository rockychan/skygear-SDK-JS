'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.SkygearError = exports.ErrorCodes = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

function _extendableBuiltin(cls) {
  function ExtendableBuiltin() {
    cls.apply(this, arguments);
  }

  ExtendableBuiltin.prototype = Object.create(cls.prototype, {
    constructor: {
      value: cls,
      enumerable: false,
      writable: true,
      configurable: true
    }
  });

  if (Object.setPrototypeOf) {
    Object.setPrototypeOf(ExtendableBuiltin, cls);
  } else {
    ExtendableBuiltin.__proto__ = cls;
  }

  return ExtendableBuiltin;
} /**
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


var ErrorCodes = exports.ErrorCodes = {
  NotAuthenticated: 101,
  PermissionDenied: 102,
  AccessKeyNotAccepted: 103,
  AccessTokenNotAccepted: 104,
  InvalidCredentials: 105,
  InvalidSignature: 106,
  BadRequest: 107,
  InvalidArgument: 108,
  Duplicated: 109,
  ResourceNotFound: 110,
  NotSupported: 111,
  NotImplemented: 112,
  ConstraintViolated: 113,
  IncompatibleSchema: 114,
  AtomicOperationFailure: 115,
  PartialOperationFailure: 116,
  UndefinedOperation: 117,
  PluginUnavailable: 118,
  PluginTimeout: 119,
  RecordQueryInvalid: 120,
  PluginInitializing: 121,
  UnexpectedError: 10000
};

function codeToString(code) {
  return _lodash2.default.findKey(ErrorCodes, function (value) {
    return code === value;
  });
}

/**
 * SkygearError is an error object containing information of an error
 * occurred.
 *
 * @example
 * let err = new SkygearError(
 *   'Unable to parse data',
 *   UnexpectedError,
 *   { content: 'BADDATA' }
 * );
 */

var SkygearError = exports.SkygearError = function (_extendableBuiltin2) {
  _inherits(SkygearError, _extendableBuiltin2);

  /**
   * Creates a SkygearError.
   * @param {string} message - an error message
   * @param {number} code - a code for the error condition
   * @param {Object} info - more information about the error
   */
  function SkygearError(message, code, info) {
    _classCallCheck(this, SkygearError);

    var _this = _possibleConstructorReturn(this, (SkygearError.__proto__ || Object.getPrototypeOf(SkygearError)).call(this, message));

    _this.message = message;
    _this.code = code || ErrorCodes.UnexpectedError;
    _this.info = info || null;
    return _this;
  }

  _createClass(SkygearError, [{
    key: 'toString',
    value: function toString() {
      return 'SkygearError: ' + this.message;
    }
  }, {
    key: 'toJSON',
    value: function toJSON() {
      var result = {
        name: codeToString(this.code),
        code: this.code,
        message: this.message
      };
      if (this.info) {
        result.info = this.info;
      }
      return result;
    }
  }], [{
    key: 'fromJSON',
    value: function fromJSON(attrs) {
      return new SkygearError(attrs.message, attrs.code || ErrorCodes.UnexpectedError, attrs.info || null);
    }
  }]);

  return SkygearError;
}(_extendableBuiltin(Error));