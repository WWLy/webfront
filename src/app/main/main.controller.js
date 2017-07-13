'use strict';

angular.module('webFront')
    .controller('MainController', ['$scope','$timeout', '$uibModal', 'userService', 'helper', 'msg', function ($scope,$timeout, $uibModal, userService, helper, msg) {

      var vm = this;
      vm.user = userService.getUser();

      vm.avata = msg.AVATAR;

      vm.defaultAvatar = msg.AVATAR;

      vm.logout = function () {
        userService.logout();
      };

      vm.pwd = function () {
        vm.user = userService.getUser();
        var modal = $uibModal.open({
          templateUrl: 'app/components/common/pwd.html',
          controller: function () {
            this.user = {};
            this.cancel = function () {
              modal.close();
            };

            this.confirm = function (u, isValid) {
              if(isValid || isValid === undefined){
                var req = {
                  name: vm.user.loginName,
                  newPassword: u.pwd,
                  oldPassword: u.oldpwd
                };

                userService.updPwd(req).then(function () {
                  modal.close();
                  helper.error(msg.UPD_SUCCESS,true);
                  $timeout(function () {
                    vm.logout();
                  }, msg.LOADING_DURATION);
                }, function (data) {
                  helper.error(data.data);
                });
              }
            };
          },
          controllerAs: 'ctrl',
          size: 'sm'
        });
      };

      //subscribe user logic
      var callback = function (needRefresh) {
        if(needRefresh){
          vm.user = userService.getUser();
        }else {
          userService.updUser().then(function () {
            vm.user = userService.getUser();
          });
        }
      };
      helper.subscribe($scope,callback,'user:upd');

    }])
    .controller('BoardController', ['helper', 'backend', 'user', '$q', function (helper, backend, user, $q) {
      var vm = this;
      vm.sum = {};

      backend.getBoard().then(function (data) {
        if (data.data) {
          for (var key in data.data) {
            vm.sum[key] = data.data[key];
          }
        }
      }, function (data) {
        helper.error(data.data);
      });

      backend.getRegisterStat().then(function (data) {
        if (data.data) {
          vm.registerData = data.data.data.values;
          vm.registerOptions = {
            type: 'line',
            lineColor: '#17997f',
            fillColor: '#1ab394'
          };
        }
      }, function (data) {
        helper.error(data.data);
      });

      this.list = [];
      this.currentPage = 0;
      this.totalCount = 0;
      this.itemsPerPage = 20;

      this.getList = function (start, restart) {
        vm.currentPage = start;
        vm.restart = !!restart;
        var q = $q.defer();
        backend.getLowVolumes(3.6, start + 1).then(function (data) {
          vm.list = data.data.data || [];
          vm.totalCount = data.data.total;
          vm.pending = false;
          q.resolve(vm.totalCount);
        }, function (err) {
          vm.pending = false;
          helper.error(err.data);
          q.reject(err.data);
        });
        return q.promise;
      };

      this.getList(0);
    }]);
