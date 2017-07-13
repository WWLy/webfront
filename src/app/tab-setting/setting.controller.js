/**
 * Created by Joe on 14/04/2017.
 */
angular.module('webFront')
    .controller('SettingController', ['$scope', 'backend', '$uibModal', '$q', 'helper', 'msg', function ($scope, backend, $uibModal, $q, helper, msg) {
      var vm = this;
      vm.tab = 'fee';
      vm.tabChange = function (index) {
        vm.tab = index;
      };

      //get company info
      vm.companyConfig = {timeFrameInMinute: 60, maintenanceList: []};
      backend.getCompanyInfo().then(function (data) {
        if (data.data.data) {
          angular.forEach(data.data.data, function (item) {
            switch (item.name) {
              case 'fee':
                vm.companyConfig.deposit = item.deposit ? item.deposit * 100 : 0;
                vm.companyConfig.perUnit = item.perUnit ? item.perUnit * 100 : 0;
                vm.companyConfig.timeFrameInMinute = item.timeFrameInMinute;
                break;
              case 'wechatSubscribe':
                vm.companyConfig.title = item.title;
                vm.companyConfig.desc = item.desc;
                vm.companyConfig.image = item.image;
                vm.companyConfig.url = item.url;
                vm.companyConfig.addUrl = item.addUrl;
                vm.companyConfig.ercodeUrl = item.ercodeUrl;
                break;
              case 'chargeAgreement':
                vm.companyConfig.chargeAgreement = item.content;
                break;
              case 'depositAgreement':
                vm.companyConfig.depositAgreement = item.content;
                break;
              case 'userAgreement':
                vm.companyConfig.userAgreement = item.content;
                break;
              case 'part':
                vm.companyConfig.maintenanceList = item.components;
                break;
            }
          });
        }
      }, function (data) {
        helper.error(data.data);
      });

      //uploader start
      //init head img uploader
      vm.uploader = backend.uploader('webback/uploadImage', true);

      //init ER img uploader
      vm.uploaderER = backend.uploader('webback/uploadImage', true);

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
              vm.layerTmp = helper.showLayer(msg.UPLOADING);
            }
          } else {
            helper.error(msg.UPLOAD_TYPE_ERROR);
            uploader.clearQueue();
          }
        }

        vm.uploader.onSuccessItem = function (fileItem, response) {
          if (response.status === 400) {
            helper.error(response);
          } else {
            vm.companyConfig.image = response.url;
            vm.uploader.clearQueue();
          }
        };
        vm.uploader.onErrorItem = function (fileItem, response) {
          helper.error(msg.UPLOAD_IMG_ERROR + ' ' + angular.toJson(response));
          vm.uploader.clearQueue();
        };
        vm.uploader.onCompleteAll = function () {
          vm.uploader.clearQueue();
          vm.layerTmp.dismiss();
        };
        vm.uploaderER.onCompleteAll = function () {
          vm.uploaderER.clearQueue();
          vm.layerTmp.dismiss();
        };

        vm.uploaderER.onSuccessItem = function (fileItem, response) {
          if (response.status === 400) {
            helper.error(response);
          } else {
            vm.companyConfig.ercodeUrl = response.url;
            vm.uploaderER.clearQueue();
          }
        };
        vm.uploaderER.onErrorItem = function (fileItem, response) {
          helper.error(msg.UPLOAD_IMG_ERROR + ' ' + angular.toJson(response));
          vm.uploaderER.clearQueue();
        };
      };
      //end

      vm.confirm = function (type) {
        vm.pending = true;
        var req = {name: type};
        switch (type) {
          case 'fee':
            req.timeFrameInMinute = vm.companyConfig.timeFrameInMinute;
            req.perUnit = parseInt(vm.companyConfig.perUnit * 100, 10);
            req.deposit = parseInt(vm.companyConfig.deposit * 100, 10);
            break;
          case 'wechatSubscribe':
            if (vm.companyConfig.title) {
              req.title = vm.companyConfig.title;
            }
            if (vm.companyConfig.desc) {
              req.desc = vm.companyConfig.desc;
            }
            if (vm.companyConfig.image) {
              req.image = vm.companyConfig.image;
            }
            if (vm.companyConfig.url) {
              req.url = vm.companyConfig.url;
            }
            if (vm.companyConfig.addUrl) {
              req.addUrl = vm.companyConfig.addUrl;
            }
            if (vm.companyConfig.ercodeUrl) {
              req.ercodeUrl = vm.companyConfig.ercodeUrl;
            }
            break;
          case 'chargeAgreement':
            req.content = vm.companyConfig.chargeAgreement;
            break;
          case 'depositAgreement':
            req.content = vm.companyConfig.depositAgreement;
            break;
          case 'userAgreement':
            req.content = vm.companyConfig.userAgreement;
            break;
          case 'part':
            req.components = vm.companyConfig.maintenanceList;
        }

        return backend.updCompanyInfo(req).then(function () {
          vm.pending = false;
          helper.error(msg.UPD_SUCCESS, true);
        }, function (data) {
          vm.pending = false;
          helper.error(msg.UPD_ERROR + ' ' + data.data);
        });
      };

      vm.crudParts = function (index, isDel) {
        if (isDel) {
          var backup = angular.copy(vm.companyConfig.maintenanceList);
          var callback = function () {
            vm.companyConfig.maintenanceList.splice(index, 1);
            return vm.confirm('part').then(function () {
            }, function () {
              vm.companyConfig.maintenanceList = backup;
            });
          };
          return helper.alert('确认删除 ' + vm.companyConfig.maintenanceList[index] + ' 吗?', callback);
        }
        var modal = $uibModal.open({
          template: function () {
            return [
              '<div class="modal-body">',
              '<div class="row text-center m-t-n-xs"><h3 class="normal-weight" ng-bind="ctrl.title"></h3></div>',
              '<div class = "row">',
              '<div class = "col-sm-12" >',
              '<p class = "m-t-xs m-b-xxs">名称:</p >',
              '<input type="text" name="name" ng-model="ctrl.name"  ng-keypress="ctrl.press($event.which === 13,ctrl.name)" class="form-control">',
              '<div >',
              '<button class = "btn btn-m btn-default pull-left m-t" ng-click = "ctrl.cancel()" type = "button" > 取  消 </button >',
              '<button ladda="ctrl.pending" ng-click="ctrl.confirm(ctrl.name)" ng-disabled="!ctrl.name" class="ladda-button btn btn-primary pull-right m-t" data-style="zoom-out"> 确  认 </button>' +
              '</div >',
              '</div >',
              '</div >',
              '</div > '
            ].join('');
          },
          controller: function () {
            var ivm = this;
            this.title = (index === undefined ? '新增' : '编辑') + '部件';
            this.name = index === undefined ? '' : vm.companyConfig.maintenanceList[index];
            this.cancel = function () {
              modal.close();
            };
            this.press = function (valid, name) {
              if (valid) {
                this.confirm(name);
              }
            };
            this.confirm = function (name) {
              this.pending = true;
              if (index === undefined) {
                vm.companyConfig.maintenanceList.unshift(name);
              } else {
                vm.companyConfig.maintenanceList[index] = name;
              }

              vm.confirm('part').then(function () {
                ivm.pending = false;
                ivm.cancel();
              }, function () {
                ivm.pending = false;
              });
            };
          },
          controllerAs: 'ctrl',
          size: 'sm'
        });
      };

      var unbind = $scope.$watch(function () {
        return vm.uploader.queue.length;
      }, function (nVal) {
        if (nVal > 0 && !vm.uploader.isUploading) {
          upload(vm.uploader);
        }
      });
      var unbind2 = $scope.$watch(function () {
        return vm.uploaderER.queue.length;
      }, function (nVal) {
        if (nVal > 0 && !vm.uploaderER.isUploading) {
          upload(vm.uploaderER);
        }
      });
      $scope.$on('$destory', function () {
        unbind();
        unbind2();
      });

    }]);