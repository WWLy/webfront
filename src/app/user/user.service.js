/**
 * Created by Joe on 17/04/2017.
 */
'use strict';
angular.module('webFront')
    .factory('userService', ['$http', '$q', 'locker', '$cookies', '$timeout', '$log', '$state', 'env', 'helper', 'msg',
      function ($http, $q, locker, $cookies, $timeout, $log, $state, env, helper, msg) {
        var user = locker.driver('session').get(msg.LOCAL_USER_KEY), token = $cookies.get(msg.COOKIE_TOKEN_KEY);
        var ts = new Date().getTime();

        if (token && !user) {
          $log.info('Restoring user from cookie...');
          auth();
        } else if (!token && !user) {
          $timeout(function () {
            rejection();
          });
        }

        function auth() {
          return $http({
            url: env.baseUrl + 'webback/authuser',
            method: 'GET',
            params: {
              ts: ts
            }
          }).then(function (data) {
            $log.info('Welcome back, ' + data.data.name);
            user = data.data;
            locker.driver('session').put(msg.LOCAL_USER_KEY, user);
            return true;
          }, function () {
            $log.info('Token no longer valid, please log in.');
            rejection();
            return false;
          });
        }

        function rejection() {
          $cookies.remove(msg.COOKIE_TOKEN_KEY, {path: '/'});
          token = undefined;
          user = undefined;
          locker.driver('session').forget(msg.LOCAL_USER_KEY);
          $state.go('login');
        }

        return {
          hasLogined: function () {
            return !!user;
          },
          login: function (name, pwd) {
            return $http({
              url: env.baseUrl + 'webback/login',
              method: 'POST',
              data: {
                name: name,
                password: pwd
              }
            }).then(function (data) {
              $log.info('login success: ' + data.data.token);
              token = data.data.token;
              $cookies.put(msg.COOKIE_TOKEN_KEY, token);
              return auth();
            }, function (err) {
              $log.info('get token error:' + angular.toJson(err.data));
              return $q.reject(err.data);
            });
          },
          forget: function (name, mail) {
            return $http({
              url: env.baseUrl + 'webback/fogetpassword',
              method: 'POST',
              data: {
                name: name,
                mail: mail
              }
            });
          },
          logout: function () {
            rejection();
          },
          getUser: function () {
            return user;
          },
          updUser: function () {
            return auth();
          },
          updPwd: function (req) {
            return $http.post(env.baseUrl + 'webback/modifyPassword', req);
          }
        };
      }
    ])
    .constant('userResolve', {
      user: ['$q', 'userService', function ($q, userService) {
        var deferred = $q.defer();
        var user = userService.getUser();
        if (user) {
          deferred.resolve(user);
        } else {
          deferred.reject();
        }
        return deferred.promise;
      }]
    });