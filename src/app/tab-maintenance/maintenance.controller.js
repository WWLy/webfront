/**
 * Created by Joe on 14/04/2017.
 */
angular.module('webFront')
    .controller('MaintenanceController', ['$q', '$uibModal', 'backend', 'helper', function ($q, $uibModal, backend, helper) {

      var vm = this;
      this.list = [];
      this.currentPage = 0;
      this.totalCount = 0;
      this.itemsPerPage = 20;

      this.getList = function (start, restart) {
        vm.currentPage = start;
        vm.restart = !!restart;
        var q = $q.defer();
        backend.getMaintenanceList(vm.status, vm.code, start + 1).then(function (data) {
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
        if (isValid === undefined || isValid) {
          this.pending = true;
          vm.getList(0, true);
        }
      };

      this.getList(0);

      this.viewHistory = function (id) {
        $uibModal.open({
          size: 'lg',
          templateUrl: 'app/tab-devices/device_fix_history.html',
          controller: function () {
            backend.getDeviceHistory(id).then(function (data) {
              ivm.list = data.data.data || [];
            }, function (err) {
              helper.error(err.data);
            });
          },
          controllerAs: 'ctrl'
        });
      };

    }]);