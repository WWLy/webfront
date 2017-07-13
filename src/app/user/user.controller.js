/**
 * Created by Joe on 17/04/2017.
 */
'use strict';
angular.module('webFront')
    .controller('LoginController', ['$state', 'msg', 'helper', 'userService', function ($state, msg, helper, userService) {
      var vm = this;
      this.focusIcon = {account: false, password: false};

      this.forgetPassword = function () {
        helper.error('暂未开发');
      };

      this.login = function () {
        if (!this.account) {
          return helper.error(msg.USER_ACCOUNT_EMPTY);
        }
        if (!this.password) {
          return helper.error(msg.USER_PASSWORD_EMPTY);
        }
        this.pending = true;
        userService.login(this.account, this.password).then(function () {
          vm.pending = false;
          helper.notify('user:upd',true);
          $state.go('webFront.main');
        }, function (data) {
          vm.pending = false;
          helper.error(data || msg.LOGIN_FAILURE);
        });
      };

      this.setFocus = function (type) {
        for (var key in vm.focusIcon) {
          vm.focusIcon[key] = key === type;
        }
      };
    }])

    .controller('UserController', ['backend', '$uibModal', 'helper', 'msg','userService', function (backend, $uibModal, helper, msg,userService) {
      var vm = this;
      vm.defaultAvatar = msg.AVATAR;
      var getUser = function () {
        backend.getUsers().then(function (data) {
          vm.list = data.data.data || [];
        }, function (err) {
          helper.error(err.data);
        });
      };
      vm.avata = msg.AVATAR;
      vm.user = userService.getUser();
      getUser();

      this.crud = function (index) {
        var modal = $uibModal.open({
          templateUrl: 'app/user/user_edit.html',
          controller: ['$scope', function ($scope) {
            var ivm = this;
            this.isEdit = index !== undefined;

            ivm.uploader = backend.uploader('webback/uploadImage', true);

            this.member = index === undefined ? {image: msg.AVATAR} : {
              name: vm.list[index].name,
              phone: vm.list[index].profile.phone,
              profileName: vm.list[index].profile.name,
              image: vm.list[index].profile.image || msg.AVATAR
            };
            this.cancel = function () {
              modal.close();
            };

            this.confirm = function () {
              this.pending = true;
              var req = {
                name: ivm.member.profileName,
                login: ivm.member.name,
                phone: ivm.member.phone,
                image: ivm.member.image
              };

              if (ivm.isEdit) {
                req.password = ivm.member.pwd;
              }

              if (index !== undefined) {
                req.id = vm.list[index]._id.$oid;
                backend.updUser(req).then(function () {
                  helper.error(msg.UPD_SUCCESS, true);
                  ivm.pending = false;

                  //upd list info
                  vm.list[index].profile.name = req.name;
                  vm.list[index].profile.phone = req.phone;
                  vm.list[index].profile.image = req.image || null;
                  vm.list[index].name = req.login;

                  //upd user owen logic
                  if(vm.list[index]._id.$oid === vm.user.id.$oid){
                    helper.notify('user:upd');
                  }
                  ivm.cancel();
                }, function (err) {
                  ivm.pending = false;
                  helper.error(err.data);
                });
              } else {
                backend.addUser(req).then(function () {
                  helper.error(msg.UPD_SUCCESS, true);
                  ivm.pending = false;
                  getUser();
                  ivm.cancel();
                }, function (err) {
                  ivm.pending = false;
                  helper.error(err.data);
                });
              }
            };

            var upload = function (uploader) {
              var name = [];
              if (uploader.queue.length === 0) {
                helper.error(msg.EMPTY_IMG);
              } else {
                name = uploader.queue[uploader.queue.length - 1].file.name.split(".");
                if (name.length >= 1) {
                  if (!helper.contains(['jpg','JPG','JPEG','jpeg','PNG','png'],name[name.length - 1])) {
                    helper.error(msg.UPLOAD_TYPE_ERROR);
                  } else {
                    uploader.uploadAll();
                    ivm.layerTmp = helper.showLayer(msg.UPLOADING);
                  }
                } else {
                  helper.error(msg.UPLOAD_TYPE_ERROR);
                  uploader.clearQueue();
                }
              }
            };

            ivm.uploader.onSuccessItem = function (fileItem, response) {
              if (response.status === 400) {
                helper.error(response);
              } else {
                ivm.member.image = response.url;
                ivm.uploader.clearQueue();
              }
            };
            ivm.uploader.onErrorItem = function (fileItem, response) {
              helper.error(msg.UPLOAD_IMG_ERROR + ' ' + angular.toJson(response));
              ivm.uploader.clearQueue();
            };
            ivm.uploader.onCompleteAll = function () {
              ivm.uploader.clearQueue();
              ivm.layerTmp.dismiss();
            };

            var unbind = $scope.$watch(function () {
              return ivm.uploader.queue.length;
            }, function (nVal) {
              if (nVal > 0 && !ivm.uploader.isUploading) {
                upload(ivm.uploader);
              }
            });
            $scope.$on('$destory', function () {
              unbind();
            });
          }],
          controllerAs: 'ctrl',
          size: 'sm'
        });
      };
    }]);