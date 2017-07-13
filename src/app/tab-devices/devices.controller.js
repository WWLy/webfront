/**
 * Created by Joe on 14/04/2017.
 */
angular.module('webFront')
  .controller('DevicesController', ['$q', '$filter', '$uibModal', 'backend', 'helper', 'msg', function($q, $filter, $uibModal, backend, helper, msg) {

    var vm = this;
    this.list = [];
    this.currentPage = 0;
    this.totalCount = 0;
    this.itemsPerPage = 20;
    var userList = [];

    this.getList = function(start, restart) {
      vm.currentPage = start;
      vm.restart = !!restart;
      var q = $q.defer();
      backend.getDevices(start + 1).then(function(data) {
        vm.list = data.data.data || [];
        vm.totalCount = data.data.total;
        vm.pending = false;
        q.resolve(vm.totalCount);
      }, function(err) {
        vm.pending = false;
        helper.error(err.data);
        q.reject(err.data);
      });
      return q.promise;
    };

    this.search = function(isValid) {
      if (isValid || isValid === undefined) {
        this.pending = true;
        vm.getList(0, true);
      }
    };

    this.getList(0);


    backend.getUsers().then(function(data) {
      userList = data.data.data || [];
    });

    this.transformStatus = function(status) {
      switch (status) {
        case 'work':
        case 'fixed':
          return '正常';
        case 'damage':
        case 'discard':
          return '损坏';
        case 'check':
          return '需检查';
        case 'lost':
          return '丢失';
      }
    };

    this.maintaince = function(kv, index) {
      var modal = $uibModal.open({
        size: 'md',
        templateUrl: 'app/tab-devices/device_maintenance_detail.html',
        controller: function() {
          var iivm = this;
          this.maintenance = [];
          this.operatorList = userList;
          this.info = { result: 'fixed' };

          backend.getCompanyInfo('part').then(function(data) {
            if (data.data.data && data.data.data[0]) {
              angular.forEach(data.data.data[0].components, function(item) {
                iivm.maintenance.push({ key: item });
              });
            }
          });

          if (kv) {
            this.info.updateOn = kv.updateOn ? $filter('date')(kv.updateOn.$date, 'yyyy-MM-dd') : '';
            //bind operator
            var operator = helper.find(this.operatorList, '_id', kv.id, true);
            this.info.operator = operator || '';

            //bind maintenance
            angular.forEach(this.maintenance, function(item) {
              item.checked = helper.contains(kv.parts, item.key);
            });
          }

          this.confirm = function() {
            this.pending = true;
            if (!iivm.info.operator) {
              iivm.pending = false;
              return helper.error(msg.OPERAROE_EMPTY);
            }
            var req = {
              id: kv.id,
              parts: [],
              userName: iivm.info.operator.profile.name,
              userId: iivm.info.operator._id.$oid,
              result: iivm.info.result,
              remark: iivm.info.remark,
              cost: iivm.info.cost
            };
            angular.forEach(iivm.maintenance, function(item) {
              if (item.checked) {
                req.parts.push(item.key);
              }
            });
            backend.updMaintenance(req).then(function() {
              iivm.pending = false;
              helper.error(msg.UPD_SUCCESS, true);
              modal.close();
              //render list item
              vm.list[index].problemFlag = false;
              vm.list[index].status = iivm, info.result;
            }, function(err) {
              iivm.error(err.data);
              iivm.pending = false;
            });
          };

          this.cancel = function() {
            modal.close();
          };
        },
        controllerAs: 'ctrl'
      });
    };

    this.viewHistory = function(id) {
      $uibModal.open({
        size: 'lg',
        templateUrl: 'app/tab-devices/device_maintenance_history.html',
        controller: function() {
          var ivm = this;
          this.list = [];
          backend.getDeviceHistory(id).then(function(data) {
            ivm.list = data.data.data || [];
          }, function(err) {
            helper.error(err.data);
          });
        },
        controllerAs: 'ctrl'
      });
    };

    this.changeDevNo = function(kv) {
      var modal = $uibModal.open({
        size: 'sm',
        templateUrl: 'app/tab-devices/device_maintenance_changeDevNo.html',
        controller: function() {
          var iiivm = this;
          // 提交新的编号
          this.changeDevNoClick = function() {
            if (kv.code == iiivm.info.newDevCode) {
              alert("编码重复");
              return;
            }
            var req = {
              id: kv.id,
              code: iiivm.info.newDevCode
            };
            backend.updDeviceNo(req).then(function(data) {
              if (data.data.status === 0) {
                kv.code = iiivm.info.newDevCode;
                modal.close();
              }

            }, function(err) {
              // iiivm.error(err.data);
              if (err.data.status === -1) {
                alert(err.data.message);
              } else {
                alert('修改失败, 请重新提交');
              }
            });
          };

          this.cancel = function() {
            modal.close();
          };
        },
        controllerAs: 'ctrl'
      });
    };

    this.device_getLocation = function(kv) {

      $uibModal.open({
        size: 'lg',
        templateUrl: 'app/tab-devices/device_map.html',
        controller: function($timeout) {
          $timeout(function() {
            var map = new AMap.Map('map', {
              center: kv.loc,
              resizeEnable: true,
              zoom: 15
            });
            var marker = new AMap.Marker({
              map: map,
              zIndex: 9999999,
              position: kv.loc
            });

            // AMapUI.loadUI(['overlay/SimpleInfoWindow'], function(SimpleInfoWindow) {

            //   var marker = new AMap.Marker({
            //     map: map,
            //     zIndex: 9999999,
            //     position: [116.309428, 39.94223]
            //   });

            //   // marker.setAnimation();
            //   // marker.setMap(map);
            //   var infoWindow = new SimpleInfoWindow({

            //     infoTitle: '<strong>这里是标题</strong>',
            //     infoBody: '<p class="my-desc"><strong>这里是内容。</strong> <br/> 高德地图 JavaScript API，是由 JavaScript 语言编写的应用程序接口，' +
            //         '它能够帮助您在网站或移动端中构建功能丰富、交互性强的地图应用程序</p>',

            //     //基点指向marker的头部位置
            //     offset: new AMap.Pixel(0, -31)
            //   });

            //   function openInfoWin() {
            //     infoWindow.open(map, marker.getPosition());
            //   }

            //   //marker 点击时打开
            //   AMap.event.addListener(marker, 'click', function() {
            //       // openInfoWin();
            //   });

            //   // openInfoWin();
            // });
          }, 100);
        },
        controllerAs: 'ctrl'
      });
    };
  }]);
