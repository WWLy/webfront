/**
 *
 * Created by Joe on 16/04/2017.
 */
'use strict';
angular.module('webFront')
    .service('backend', ['$http', 'env', 'FileUploader', '$cookies', 'msg', function ($http, env, FileUploader, $cookies, msg) {
      return {
        getDevices: function (plug, code, start, limit) {
          return $http({
            method: 'GET',
              params: {
                plug: plug || null,
                limit: limit || msg.LIMIT,
                start: start || 1,
                code: code || null
              },
              url: env.baseUrl + 'webback/chargePoints'
          });
        },

        // 修改充电桩数据
        updateDevice: function (id, location, perUnit) {
            return $http({
                method: 'POST',
                params: {
                    id: id,
                    loc: location || null,
                    perUnit: perUnit || null
                },
                url: env.baseUrl + 'webback/chargePoint/update'
            });
        },

        uploader: function (url, isImg) {
          return new FileUploader({
            url: env.baseUrl + url,
            headers: {
              'X-XSRF-TOKEN': $cookies.get(msg.COOKIE_TOKEN_KEY)
            },
            alias: isImg ? 'imageData' : 'file'
          });
        },
        getBoard: function () {
          return $http.get(env.baseUrl + 'webback/homepage');
        },
        getCompanyInfo: function (name) {
          return $http({
            method: 'GET',
            params: {
              name: name || null
            },
            url: env.baseUrl + 'webback/company'
          });
        },
        updCompanyInfo: function (req) {
          return $http.post(env.baseUrl + 'webback/updcompany', req);
        },
        getCustomers: function (status, content, start, url, limit) {
          return $http({
            method: 'GET',
            params: {
              status: status || null,
              limit: limit || msg.LIMIT,
              start: start || 1,
              code: content || null,
              query: content || null
            },
            url: env.baseUrl + 'webback/' + (url ? 'accountHistory' : 'customers')
          });
        },
        getCustomerDetail: function (cid) {
          return $http.get(env.baseUrl + 'webback/customer?cid=' + cid);
        },
        depositBack: function (req) {
          return $http.post(env.baseUrl + 'webback/deposit/confirm', req);
        },
        getDevices_old: function (status, content, start, limit) {
          return $http({
            method: 'GET',
            params: {
              status: status || null,
              limit: limit || msg.LIMIT,
              start: start || 1,
              code: content || null
            },
            url: env.baseUrl + 'webback/devices'
          });
        },
        getDeviceHistory: function (id) {
          return $http.get(env.baseUrl + 'webback/device/problemReport?deviceId=' + id);
        },
        getMaintenanceList: function (status, content, start, limit) {
          return $http({
            method: 'GET',
            params: {
              status: status || null,
              limit: limit || msg.LIMIT,
              start: start || 1,
              code: content || null
            },
            url: env.baseUrl + 'webback/maintenances'
          });
        },

        getProblemList: function (isFinished, start, limit) {
          return $http({
            method: 'GET',
            params: {
              finished: isFinished || false,
              limit: limit || msg.LIMIT,
              start: start || 1

            },
            url: env.baseUrl + 'webback/problems'
          });
        },
        getLowVolumes: function (thresholdOfVolume, start, limit) {
          return $http({
            method: 'GET',
            params: {
              threshold: thresholdOfVolume || null,
              limit: limit || msg.LIMIT,
              start: start || 1

            },
            url: env.baseUrl + 'webback/lowVolumes'
          });
        },
        getMaintenance: function (id) {
          return $http.get(env.baseUrl + 'webback/maintenance?mid=' + id);
        },
        updMaintenance: function (req) {
          return $http.post(env.baseUrl + 'webback/problemReport/update', req);
        },
        updDeviceNo: function (req) {
          return $http.post(env.baseUrl + 'webback/device/update', req);
        },

        //stat
        statCustomer: function () {
          return $http.get(env.baseUrl + 'webback/stat/customer');
        },
        statDevice: function () {
          return $http.get(env.baseUrl + 'webback/stat/device');
        },
        statMaintenance: function () {
          return $http.get(env.baseUrl + 'webback/stat/maintenance');
        },
        statFinance: function () {
          return $http.get(env.baseUrl + 'webback/stat/finance');
        },
        getRegisterStat: function () {
          return $http.get(env.baseUrl + 'webback/stat/register');
        },

        addUser: function (req) {
          return $http.post(env.baseUrl + 'webback/user/add', req);
        },
        updUser: function (req) {
          return $http.post(env.baseUrl + 'webback/user/edit', req);
        },
        getUsers: function () {
          return $http.get(env.baseUrl + 'webback/users');
        },
        close: function (req) {
          return $http.post(env.baseUrl + 'webback/close', req);
        }
      };
    }]);
