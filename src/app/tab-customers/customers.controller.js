/**
 * Created by Joe on 14/04/2017.
 */
angular.module('webFront')
    .controller('CustomersController', ['$q', '$uibModal', 'backend', '$state', 'helper', 'msg', function ($q, $uibModal, backend, $state, helper, msg) {
      var vm = this;
      this.defaultAvatar = msg.AVATAR;
      this.list = [];
      this.currentPage = 0;
      this.totalCount = 0;
      this.itemsPerPage = 20;

      this.isRefund = $state.current.name === 'webFront.refund';

      this.getList = function (start, restart) {
        vm.currentPage = start;
        vm.restart = !!restart;
        var q = $q.defer();
        backend.getCustomers(vm.status, vm.code, start + 1, vm.isRefund).then(function (data) {
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

      this.search = function (isValid) {
        if (isValid || isValid === undefined) {
          this.pending = true;
          vm.getList(0, true);
        }
      };

      this.getList(0);

      this.viewDetail = function (id) {
        var modal = $uibModal.open({
          size: 'lg',
          templateUrl: 'app/tab-customers/customer_detail.html',
          controller: function () {
            var ivm = this;
            // this.confirm = function (valid) {
            //   backend.depositBack({id: this.info._id.$oid, isConfirm: valid}).then(function () {
            //     helper.error(msg.UPD_SUCCESS, true);
            //   }, function () {
            //     helper.error(msg.UPD_ERROR);
            //   });
            // };
            backend.getCustomerDetail(id).then(function (data) {
              if(data.data && data.data.status === -1){
                helper.error(data.data);
                modal.dismiss();
              }else {
                ivm.list = data.data.accountHistory || [];
                ivm.usage = data.data.usage || [];
                ivm.info = data.data.data || {};
                ivm.exception = data.data.exception || false;
              }
            }, function (err) {
              helper.error(err.data);
            });

            this.typeFilter = function () {
              return function (kv) {
                return kv.result !== '待支付';
              };
            };

            this.dealError = function () {
              dealError(ivm.exception, id);
            };
          },
          controllerAs: 'ctrl'
        });
      };

      this.maintain = function (kv, index) {
        var req = {
          customerId: kv.customer._id
        }, confirm = function () {
          req.isConfirm = true;
          return callback();
        }, cancel = function () {
          req.isConfirm = true;
          callback();
        }, callback = function () {
          return backend.depositBack(req).then(function () {
            helper.error(msg.OPERATION_SUCCESS, true);
            vm.list[index].result = 'done';
          }, function () {
            helper.error(msg.OPERATION_ERROR);
          });
        };

        helper.alert('确认退还押金么', confirm, '同意申请', cancel, '驳回申请');
      };

      var dealError = function (exception, id) {
        var modal = $uibModal.open({
          size: 'sm',
          templateUrl: 'app/tab-customers/customer_error.html',
          controller: function () {
            var ivm = this;
            this.exception = exception;

            this.description = 'test';
            this.url = this.exception.images && ctrl.exception.images.length.length > 0 ? ctrl.exception.images : [];

            this.cancel = function () {
              modal.close();
            };

            this.viewImg = function () {
              var modal = $uibModal.open({
                template: function () {
                  return [
                    '<div class="modal-body p-none">',
                    '<div uib-carousel active="ctrl.active" interval="5000">',
                    '<div uib-slide ng-repeat="slide in ctrl.imglist" index="$index">',
                    '<img ng-src="{{slide.url}}" style="margin:auto;">',
                    '<div class="carousel-caption">',
                    '<p ng-bind="slide.name"></p>',
                    '</div>',
                    '</div>',
                    '</div>',
                    '</div>'
                  ].join('');
                },
                controller: function () {
                  this.imglist = [ivm.url];
                  this.active = index || 0;
                },
                controllerAs: 'ctrl'
              });
            };

            this.confirm = function () {
              this.pending = true;
              backend.close({customerId: id}).then(function () {
                ivm.pending = false;
                helper.error(msg.UPD_SUCCESS, true);
                modal.close();
              }, function () {
                ivm.pending = false;
                helper.error(msg.UPD_ERROR);
              });
            };

          },
          controllerAs: 'ctrl'
        });
      };
    }]);