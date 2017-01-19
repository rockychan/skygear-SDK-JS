'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.RelationAction = exports.RelationQueryResult = exports.RelationRemoveResult = exports.RelationResult = exports.RelationQuery = exports.Relation = exports.Mutual = exports.Inward = exports.Outward = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _user = require('./user');

var _user2 = _interopRequireDefault(_user);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

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
}

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/**
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
var _ = require('lodash');

var Outward = exports.Outward = 'outward';
var Inward = exports.Inward = 'inward';
var Mutual = exports.Mutual = 'mutual';

var format = /^[a-zA-Z]+$/;

var Relation = exports.Relation = function () {
  function Relation(identifier, direction) {
    var targets = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : [];

    _classCallCheck(this, Relation);

    if (!Relation.validName(identifier)) {
      throw new Error('Relation identifier can only be [a-zA-Z]+');
    }
    this.identifier = identifier;
    if (Relation.validDirection(direction)) {
      this.direction = direction;
    } else {
      throw new Error('Relation direction not supported.');
    }
    this.targets = targets;
    this.fails = [];
  }

  _createClass(Relation, [{
    key: 'targetsID',
    get: function get() {
      return _.map(this.targets, function (user) {
        return user.id;
      });
    }
  }], [{
    key: 'validDirection',
    value: function validDirection(direction) {
      return direction === Mutual || direction === Outward || direction === Inward;
    }
  }, {
    key: 'validName',
    value: function validName(identifier) {
      return format.test(identifier);
    }
  }]);

  return Relation;
}();

var RelationQuery = exports.RelationQuery = function () {
  function RelationQuery(relationCls) {
    _classCallCheck(this, RelationQuery);

    this.identifier = relationCls.prototype.identifier;
    this.direction = relationCls.prototype.direction;
    this.limit = 50;
    this.page = 0;
  }

  _createClass(RelationQuery, [{
    key: 'toJSON',
    value: function toJSON() {
      return {
        name: this.identifier,
        direction: this.direction,
        limit: this.limit,
        page: this.page
      };
    }
  }]);

  return RelationQuery;
}();

var RelationResult = exports.RelationResult = function RelationResult(results) {
  _classCallCheck(this, RelationResult);

  this.success = [];
  this.fails = [];
  this.partialError = false;
  var len = results.length;
  for (var i = 0; i < len; i++) {
    if (results[i].type === 'error') {
      this.fails.push(results[i]);
      this.partialError = true;
    } else {
      this.success.push(new _user2.default(results[i].data));
    }
  }
};

var RelationRemoveResult = exports.RelationRemoveResult = function RelationRemoveResult(results) {
  _classCallCheck(this, RelationRemoveResult);

  this.success = [];
  this.fails = [];
  this.partialError = false;
  var len = results.length;
  for (var i = 0; i < len; i++) {
    if (results[i].type === 'error') {
      this.fails.push(results[i]);
      this.partialError = true;
    } else {
      this.success.push(results[i].id);
    }
  }
};

var RelationQueryResult = exports.RelationQueryResult = function (_extendableBuiltin2) {
  _inherits(RelationQueryResult, _extendableBuiltin2);

  function RelationQueryResult() {
    _classCallCheck(this, RelationQueryResult);

    return _possibleConstructorReturn(this, (RelationQueryResult.__proto__ || Object.getPrototypeOf(RelationQueryResult)).apply(this, arguments));
  }

  _createClass(RelationQueryResult, [{
    key: 'overallCount',
    get: function get() {
      return this._overallCount;
    }
  }], [{
    key: 'createFromBody',
    value: function createFromBody(body) {
      var users = _.map(body.result, function (attrs) {
        return new _user2.default(attrs.data);
      });
      var result = new RelationQueryResult();
      users.forEach(function (val) {
        return result.push(val);
      });
      var info = body.info;
      result._overallCount = info ? info.count : undefined;
      return result;
    }
  }]);

  return RelationQueryResult;
}(_extendableBuiltin(Array));

var RelationAction = exports.RelationAction = function () {
  function RelationAction(container) {
    _classCallCheck(this, RelationAction);

    this.container = container;
  }

  _createClass(RelationAction, [{
    key: 'query',
    value: function query(queryObj) {
      var relationAction = this;
      return new Promise(function (resolve, reject) {
        relationAction.container.makeRequest('relation:query', queryObj.toJSON()).then(function (body) {
          var users = RelationQueryResult.createFromBody(body);
          resolve(users);
        }, function (err) {
          reject(err);
        });
      });
    }
  }, {
    key: 'queryFriend',
    value: function queryFriend(actor) {
      if (actor === null) {
        actor = this.container.currentUser;
      }
      var query = new RelationQuery(this.Friend);
      query.user = actor;
      return this.query(query);
    }
  }, {
    key: 'queryFollower',
    value: function queryFollower(actor) {
      if (actor === null) {
        actor = this.container.currentUser;
      }
      var query = new RelationQuery(this.Follower);
      query.user = actor;
      return this.query(query);
    }
  }, {
    key: 'queryFollowing',
    value: function queryFollowing(actor) {
      if (actor === null) {
        actor = this.container.currentUser;
      }
      var query = new RelationQuery(this.Following);
      query.user = actor;
      return this.query(query);
    }
  }, {
    key: 'add',
    value: function add(relation) {
      return new Promise(function (resolve, reject) {
        this.container.makeRequest('relation:add', {
          name: relation.identifier,
          direction: relation.direction,
          targets: relation.targetsID
        }).then(function (body) {
          var result = new RelationResult(body.result);
          resolve(result);
        }, function (err) {
          reject(err);
        });
      }.bind(this));
    }
  }, {
    key: 'remove',
    value: function remove(relation) {
      return new Promise(function (resolve, reject) {
        this.container.makeRequest('relation:remove', {
          name: relation.identifier,
          direction: relation.direction,
          targets: relation.targetsID
        }).then(function (body) {
          var result = new RelationRemoveResult(body.result);
          resolve(result);
        }, function (err) {
          reject(err);
        });
      }.bind(this));
    }
  }, {
    key: 'Query',
    get: function get() {
      return RelationQuery;
    }
  }, {
    key: 'Friend',
    get: function get() {
      return RelationAction.extend('friend', Mutual);
    }
  }, {
    key: 'Follower',
    get: function get() {
      return RelationAction.extend('follow', Inward);
    }
  }, {
    key: 'Following',
    get: function get() {
      return RelationAction.extend('follow', Outward);
    }
  }], [{
    key: 'extend',
    value: function extend(identifier, direction) {
      if (!Relation.validName(identifier)) {
        throw new Error('Relation identifier can only be [a-zA-Z]+');
      }
      var RelationProto = {
        identifier: identifier,
        direction: direction
      };
      function RelationCls() {
        var targets = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : [];

        Relation.call(this, identifier, direction);
        this.targets = targets;
      }
      RelationCls.prototype = _.create(Relation.prototype, RelationProto);
      return RelationCls;
    }
  }]);

  return RelationAction;
}();