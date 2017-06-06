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
/* eslint camelcase: 0 */
const request = require('superagent');
const _ = require('lodash');
const ee = require('event-emitter');

import Asset from './asset';
import User from './user';
import Role from './role';
import ACL from './acl';
import Record from './record';
import Reference from './reference';
import Query from './query';
import {Database} from './database';
import Geolocation from './geolocation';
import getStore from './store';
import {Sequence} from './type';
import {ErrorCodes, SkygearError} from './error';

import {AuthContainer} from './auth';
import {RelationContainer} from './relation';
import {DatabaseContainer} from './database';
import {PubsubContainer} from './pubsub';
import {PushContainer} from './push';

export class BaseContainer {

  constructor() {
    this.url = '/* @echo API_URL */';
    this.apiKey = null;
    this.request = request;
    this.ee = ee({});
  }

  config(options) {
    if (options.apiKey) {
      this.apiKey = options.apiKey;
    }
    if (options.endPoint) {
      this.endPoint = options.endPoint;
    }

    return Promise.resolve(this);
  }

  configApiKey(ApiKey) {
    this.apiKey = ApiKey;
  }

  makeRequest(action, data) {
    let requestObject = this._prepareRequestObject(action, data);
    let requestData = this._prepareRequestData(action, data);

    return this._handleResponse(new Promise((resolve)=> {
      requestObject.send(requestData).end((err, res)=> {
        resolve({
          err: err,
          res: res,
        });
      });
    }));
  }

  makeUploadAssetRequest(asset) {
    return new Promise((resolve, reject)=> {
      this.makeRequest('asset:put', {
        filename: asset.name,
        'content-type': asset.contentType,
        'content-size': asset.file.size
      })
      .then((res)=> {
        const newAsset = Asset.fromJSON(res.result.asset);
        const postRequest = res.result['post-request'];

        let postUrl = postRequest.action;
        if (postUrl.indexOf('/') === 0) {
          postUrl = postUrl.substring(1);
        }
        if (postUrl.indexOf('http') !== 0) {
          postUrl = this.url + postUrl;
        }

        let _request = this.request
          .post(postUrl)
          .set('X-Skygear-API-Key', this.apiKey);
        if (postRequest['extra-fields']) {
          _.forEach(postRequest['extra-fields'], (value, key)=> {
            _request = _request.field(key, value);
          });
        }

        _request.attach('file', asset.file).end((err)=> {
          if (err) {
            reject(err);
            return;
          }

          resolve(newAsset);
        });
      }, (err)=> {
        reject(err);
      });
    });
  }

  lambda(name, data) {
    return this.makeRequest(name, {
      args: data
    }).then((resp)=> resp.result);
  }

  _prepareRequestObject(action, data) {
    if (this.apiKey === null) {
      throw Error('Please config ApiKey');
    }

    let _action = action.replace(/:/g, '/');
    return this.request
      .post(this.url + _action)
      .set('X-Skygear-API-Key', this.apiKey)
      .set('Accept', 'application/json');
  }

  _prepareRequestData(action, data) {
    if (this.apiKey === null) {
      throw Error('Please config ApiKey');
    }

    return _.assign({
      action: action,
      api_key: this.apiKey,
    }, data);
  }

  _handleResponse(responsePromise) {
    return responsePromise.then(({err, res})=> {
      // Do an application JSON parse because in some condition, the
      // content-type header will got strip and it will not deserial
      // the json for us.
      let body = getRespJSON(res);

      if (err) {
        let skyErr = body.error || err;
        return Promise.reject({
          status: err.status,
          error: skyErr
        });
      } else {
        return Promise.resolve(body);
      }
    });
  }

  get Query() {
    return Query;
  }

  get User() {
    return User;
  }

  get Role() {
    return Role;
  }

  get ACL() {
    return ACL;
  }

  get Record() {
    return Record;
  }

  get UserRecord() {
    return Record.extend('user');
  }

  get Sequence() {
    return Sequence;
  }

  get Asset() {
    return Asset;
  }

  get Reference() {
    return Reference;
  }

  get Geolocation() {
    return Geolocation;
  }

  get Friend() {
    return this.relation.Friend;
  }

  get Follower() {
    return this.relation.Follower;
  }

  get Following() {
    return this.relation.Following;
  }

  get ErrorCodes() {
    return ErrorCodes;
  }

  get endPoint() {
    return this.url;
  }

  set endPoint(newEndPoint) {
    // TODO: Check the format
    if (newEndPoint) {
      if (!_.endsWith(newEndPoint, '/')) {
        newEndPoint = newEndPoint + '/';
      }
      this.url = newEndPoint;
    }
  }

  get store() {
    if (!this._store) {
      this._store = getStore();
    }
    return this._store;
  }

  clearCache() {
    return this.store.clearPurgeableItems();
  }

  get Database() {
    return Database;
  }

}

export default class Container extends BaseContainer {

  constructor() {
    super();

    this._auth = new AuthContainer(this);
    this._relation = new RelationContainer(this);
    this._db = new DatabaseContainer(this);
    this._pubsub = new PubsubContainer(this);
    this._push = new PushContainer(this);
    /**
     * Options for how much time to wait for client request to complete.
     *
     * @type {Object}
     * @property {number} [timeoutOptions.deadline] - deadline for the request
     * and response to complete (in milliseconds)
     * @property {number} [timeoutOptions.response=60000] - maximum time to
     * wait for an response (in milliseconds)
     *
     * @see http://visionmedia.github.io/superagent/#timeouts
     */
    this.timeoutOptions = {
      response: 60000
    };
  }

  get auth() {
    return this._auth;
  }

  get relation() {
    return this._relation;
  }

  get publicDB() {
    return this._db.public;
  }

  get privateDB() {
    return this._db.private;
  }

  get pubsub() {
    return this._pubsub;
  }

  get push() {
    return this._push;
  }

  config(options) {
    return super.config(options).then(()=> {
      let promises = [
        this.auth._getUser(),
        this.auth._getAccessToken(),
        this.push._getDeviceID()
      ];
      return Promise.all(promises);
    }).then(()=> {
      this.pubsub._reconfigurePubsubIfNeeded();
      return this;
    }, ()=> {
      return this;
    });
  }

  _prepareRequestObject(action, data) {
    let requestObject = super._prepareRequestObject(action, data);

    requestObject = requestObject
      .set('X-Skygear-Access-Token', this.auth.accessToken);

    if (this.timeoutOptions !== undefined && this.timeoutOptions !== null) {
      requestObject = requestObject.timeout(this.timeoutOptions);
    }

    return requestObject;
  }

  _prepareRequestData(action, data) {
    let requestData = super._prepareRequestData(action, data);

    return _.assign({
      access_token: this.auth.accessToken
    }, requestData);
  }

  _handleResponse(responsePromise) {
    return super._handleResponse(responsePromise)
      .catch((err)=> {
        // Logout user implicitly if
        let errorCode = err.error.code;
        if (errorCode === this.ErrorCodes.AccessTokenNotAccepted) {
          return Promise.all([
            this.auth._setAccessToken(null),
            this.auth._setUser(null)
          ]).then(() => {
            return Promise.reject(err);
          });
        }

        return Promise.reject(err);
      });
  }

}

function getRespJSON(res) {
  if (res && res.body) {
    return res.body;
  }
  if (res && res.text) {
    try {
      return JSON.parse(res.text);
    } catch (err) {
      console.log('getRespJSON error. error: ', err);
    }
  }

  return {};
}
