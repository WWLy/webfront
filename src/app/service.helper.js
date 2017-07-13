/**
 * Created by Joe on 16/04/2017.
 */
'use strict';

angular.module('webFront')
    .service('helper', ['$rootScope', 'notify', '$uibModal', '$q', '$timeout',
      function ($rootScope, notify, $uibModal, $q, $timeout) {
        return {
          // notify error
          error: function (data, isValid) {
            notify({
              message: (data && data.message ? data.message : data),
              duration: 3000,
              classes: isValid ? 'alert-info' : 'alert-danger',
              position: 'right',
              templateUrl: 'app/components/common/notify.html'
            });
          },

          // alert form with cancel and confirm buttons
          // callback need a promise
          alert: function (data, callback,confirmTxt, cancel, cancelTxt) {
            var modal = $uibModal.open({
              size: 'sm',
              templateUrl: 'app/components/common/alert.html',
              controller: function () {
                var vm = this;
                this.info = data || '';

                this.confirmTxt = confirmTxt || '确认';
                this.cancelTxt = cancelTxt || '取消';
                this.cancel = function () {
                  if (cancel) {
                    cancel();
                  }
                  modal.dismiss();
                };
                this.confirm = function () {
                  this.pending = true;
                  //TODO add promise check
                  callback().then(function () {
                    vm.pending = false;
                    modal.dismiss();
                  }, function () {
                    vm.pending = false;
                    modal.dismiss();
                  });
                };
              },
              controllerAs: 'ctrl'
            });
          },

          // find function, return obj or undefined
          find: function (list, key, flag, isoid) {
            //params:list, key ,
            return $rootScope.find(list, function (ele) {
              return isoid ? ele[key].$oid === flag.$oid : ele[key] === flag;
            });
          },

          contains: function (list, key) {
            return $rootScope.contains(list, key);
          },

          subscribe: function (scope, callback, evt) {
            var deregistration = $rootScope.$on(evt, function (event, data) {
              callback(data);
            });
            scope.$on('$destory', deregistration);
          },

          notify: function (evt, data) {
            $rootScope.$emit(evt, data);
          },

          searchDisabled: function (start, end) {
            var a = new Date(start).getTime(),
                b = new Date(end).getTime();
            return a > b;
          },

          showLayer: function (content) {
            return $uibModal.open({
              templateUrl: 'app/components/common/layer.html',
              backdrop: 'static',
              windowClass: 'back-layer',
              controller: function () {
                this.message = content;
              },
              controllerAs: 'ctrl'
            });
          },

          chunkAndBatchRender: function (vm, hash, collection, size) {
            //any comment?
            var promise = $q.resolve();
            var chunked = chunk(collection, size);
            chunked.forEach(function (chunk) {
              promise = promise.then(scheduleRender.bind(null, chunk));
            });

            function chunk(collection, size) {
              for (var i = 0, chunks = []; i < collection.length; i += size) {
                chunks.push(collection.slice(i, i + size));
              }
              return chunks;
            }

            function scheduleRender(chunk) {
              Array.prototype.push.apply(vm[hash], chunk);
              return $timeout(function () {
              }, 0);
            }

            return promise;
          }
        };
      }
    ]);