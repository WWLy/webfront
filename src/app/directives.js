'use strict';

//Directive used to set metisMenu and minimalize button
angular.module('webFront')
    .directive('sideNavigation', ['$timeout', function ($timeout) {
      return {
        restrict: 'A',
        link: function (scope, element) {
          // Call metsi to build when user signup
          scope.$watch('authentication.user', function () {
            $timeout(function () {
              element.metisMenu();
            });
          });

          // Colapse menu in mobile mode after click on element
          var menuElement = angular.element('#side-menu a:not([href$="\\#"])');
          menuElement.click(function () {
            if (angular.element(window).width() < 769) {
              angular.element("body").toggleClass("mini-navbar");
            }
          });

          // Enable initial fixed sidebar
          if (angular.element("body").hasClass('fixed-sidebar')) {
            var sidebar = element.parent();
            sidebar.slimScroll({
              height: '100%',
              railOpacity: 0.9
            });
          }

        }
      };
    }])
    .directive('minimalizaSidebar', ['$timeout', function ($timeout) {
      return {
        restrict: 'A',
        template: '<a class="navbar-minimalize minimalize-styl-2 btn btn-primary " href="" ng-click="minimalize()"><i class="fa fa-bars"></i></a>',
        controller: function ($scope) {
          $scope.minimalize = function () {
            angular.element('body').toggleClass('mini-navbar');
            if (!angular.element('body').hasClass('mini-navbar') || angular.element('body').hasClass('body-small')) {
              // Hide menu in order to smoothly turn on when maximize menu
              angular.element('#side-menu').hide();
              // For smoothly turn on menu
              $timeout(function () {
                angular.element('#side-menu').fadeIn(400);
              }, 200);
            } else {
              // Remove all inline style from jquery fadeIn function to reset menu state
              angular.element('#side-menu').removeAttr('style');
            }
          };
        }
      };
    }])
    .directive('renderPager', function () {
      return {
        restrict: 'E',
        scope: {
          render: '&', //controller invoke getList function, return total promise
          start: '=', //getList start (+1) param
          limit: '@', //getList limit param
          total: '@',
          restart: '=' //whether controller's list has sort value
        },
        template: function (tEle, tAttrs) {
          var tString = "<ul id=\"menu\" class=\"pager pageMenu\">",
              tString2 = "<ul class=\"pager pageMenu\">",
              tArr2 = ["<li> <a href=\"\" ng-click=\"ctrl.clickPage()\">跳转</a> </li>",
                "<li> <span style='padding: 5px 0;'>到第 <input type=\"text\" size=\"2\" style=\"height:20px\" ng-model=\"ctrl.page\"> 页</span> </li>",
                "<li> <span style='padding: 5px 0;' ng-bind=\"'共 ' +(ctrl.pageCount + 1) + ' 页'\"></span> </li>",
                "<li ng-click=\"ctrl.lastPage()\" ng-class=\"ctrl.nextPageDisabled()\"> <a href=\"\"> 尾页 </a> </li>",
                "<li ng-class=\"ctrl.nextPageDisabled()\" class=\"pageIndex\" ng-click=\"ctrl.nextPage()\"> <a href=\"\"> 下一页 </a> </li>",
                "<li ng-class=\"ctrl.prevPageDisabled()\" class=\"pageIndex\" ng-click=\"ctrl.prevPage()\"> <a href=\"\"> 上一页 </a> </li>",
                "<li class=\"pageIndex\" ng-class=\"ctrl.prevPageDisabled()\" ng-click=\"ctrl.firstPage()\"> <a href=\"\"> 首页 </a> </li>",
                "<li> <span style='padding: 5px 0;' ng-bind=\" (ctrl.currentPage * ctrl.itemsPerPage + 1) + ' - ' + ((ctrl.totalCount>((ctrl.currentPage + 1) *ctrl.itemsPerPage))?((ctrl.currentPage + 1) *ctrl.itemsPerPage):ctrl.totalCount) + ' of ' + (ctrl.totalCount)\"></span> </li>"
              ],
              tString3 = "</ul>";
          return tAttrs.position === 'center' ? (tString2 + tArr2.reverse().join("") + tString3) : (tString + tArr2.join("") + tString3);
        },
        controllerAs: 'ctrl',
        controller: ['$scope', '$attrs', function (scope, attrs) {
          var isFrontPager = attrs.frontpager === 'front';
          var vm = this;
          vm.position = scope.position === 'center' ? '' : 'menu';
          vm.itemsPerPage = parseInt(scope.limit, 10);
          vm.currentPage = parseInt(scope.start, 10);

          vm.firstPage = function () {
            if (isFrontPager) {
              scope.start = 0;
              vm.currentPage = 0;
              scope.restart = false;
              scope.render({start: vm.currentPage});
            } else {
              scope.render({start: 0}).then(function (total) {
                vm.totalCount = total;
                vm.pageCount = Math.ceil(vm.totalCount / vm.itemsPerPage) - 1;
                vm.currentPage = 0;
              });
            }
          };
          vm.lastPage = function () {
            if (isFrontPager) {
              scope.start = vm.pageCount;
              scope.restart = false;
              vm.currentPage = vm.pageCount;
              scope.render({start: vm.currentPage});
            } else {
              scope.render({start: vm.pageCount}).then(function (total) {
                vm.totalCount = total;
                vm.pageCount = Math.ceil(vm.totalCount / vm.itemsPerPage) - 1;
                if (scope.restart) {
                  vm.currentPage = 0;
                }
                vm.currentPage = vm.pageCount;
              });
            }
          };
          vm.prevPage = function () {
            if (vm.currentPage > 0) {
              if (isFrontPager) {
                scope.start--;
                scope.restart = false;
                vm.currentPage--;
                scope.render({start: vm.currentPage});
              } else {
                scope.render({start: vm.currentPage - 1}).then(function (total) {
                  vm.totalCount = total;
                  vm.pageCount = Math.ceil(vm.totalCount / vm.itemsPerPage) - 1;
                  vm.currentPage--;
                });
              }
            }
          };

          vm.nextPage = function () {
            if (vm.currentPage < vm.pageCount) {
              if (isFrontPager) {
                scope.start++;
                scope.restart = false;
                vm.currentPage++;
                scope.render({start: vm.currentPage});
              } else {
                scope.render({start: vm.currentPage + 1}).then(function (total) {
                  vm.totalCount = total;
                  vm.pageCount = Math.ceil(vm.totalCount / vm.itemsPerPage) - 1;
                  vm.currentPage++;
                });
              }
            }
          };

          vm.clickPage = function () {
            if (!isNaN(vm.page) && vm.page > 0) {
              vm.page = vm.page > vm.pageCount + 1 ? vm.pageCount + 1 : vm.page;
              if (isFrontPager) {
                scope.start = vm.page - 1;
                scope.restart = false;
                vm.currentPage = vm.page - 1;
                scope.render({start: vm.currentPage});
              } else {
                scope.render({start: vm.page - 1}).then(function (total) {
                  vm.totalCount = total;
                  vm.pageCount = Math.ceil(vm.totalCount / vm.itemsPerPage) - 1;
                  vm.currentPage = vm.page - 1;
                });
              }
            }
          };

          vm.nextPageDisabled = function () {
            return vm.currentPage === vm.pageCount ? 'disabled' : '';
          };

          vm.prevPageDisabled = function () {
            return vm.currentPage === 0 ? 'disabled' : '';
          };

          scope.$watch(function () {
            return scope.total;
          }, function (nTotal) {
            if (nTotal !== undefined) {
              vm.totalCount = parseInt(nTotal, 10);
              vm.pageCount = Math.ceil(vm.totalCount / vm.itemsPerPage) - 1;
            }
          });

          //watch sort
          //use in sort,then set currentpage to 0
          scope.$watch(function () {
            return scope.restart;
          }, function (nSort) {
            if (nSort === true) {
              vm.currentPage = 0;
              scope.start = 0;
            }
          });
        }]
      };
    })
    .directive('iuChart', function () {
      return {
        restrict: 'EA',
        template: '<div></div>',
        replace: true,
        scope: {
          iuChart: '='
        },
        link: function (scope, elem) {
          var dom, api, chart, eventId, watch, option = scope.iuChart;
          var textStyle = {
            color: 'black',
            fontSize: 18,
            fontWeight: 700,
            fontFamily: 'Microsoft Yahei, Arial'
          };

          initializeChart();

          /**
           * initialize Chart
           */
          function initializeChart() {
            dom = elem.find('div')[0] || elem[0];
            if (!dom.clientHeight) {
              getSizes();
            }
            chart = echarts.init(dom, 'macarons');
            //chart.setOption(option);

            renderData(scope.iuChart);
            if (angular.isFunction(option.onRegisterApi)) {
              initializeApi();
              option.onRegisterApi(api);
            }

            if (angular.isDefined(scope.iuChart.version)) {
              watch = scope.$watch('iuChart.version', function (newValue, oldValue) {
                if (newValue !== oldValue) {
                  getSizes();
                  chart.resize();
                  // chart.refresh();
                  renderData(scope.iuChart);
                }
              });
            }

            scope.$on('$destroy', function () {
              if (watch) {
                watch();
              }
              chart.dispose();
              chart = null;
            });

            angular.element(window).on('resize', function () {
              if (chart) {
                setTimeout(function () {
                  getSizes();
                  chart.resize();
                  // chart.refresh();
                  renderData(scope.iuChart);
                }, 250);
              }

            });
          }

          function getSizes() {
            var width = (scope.iuChart && scope.iuChart.width) || 640;
            var height = (scope.iuChart && scope.iuChart.height) || 480;
            dom.style.width = width + 'px';
            dom.style.height = height + 'px';
          }

          function renderData(data) {
            if (data.series[0].data.length === 0) {
              chart.clear();
              chart.showLoading('default', {
                text: '暂无数据',
                color: '#eee'
                // textColor: '#7e7e7e'
              });
            } else {
              chart.hideLoading();
              chart.setOption(data, true);
            }
          }

          /**
           * create api interface
           */
          function initializeApi() {
            api = {
              set: function (newOption) {
                renderData(newOption);
              },
              /**
               * get eCharts instance
               * @returns {object} echart
               */
              getInstance: function () {
                return chart;
              },
              /**
               * dynamic add data
               * @param data
               */
              addData: function (data) {
                chart.addData(data);
              },

              /**
               * connect to other chart
               * @param oApi
               * @param nApi 可选
               */
              connect: function (oApi, nApi) {
                if (oApi && nApi) {
                  chart.connect([oApi.getInstance(), nApi.getInstance()]);
                } else {
                  chart.connect([oApi.getInstance()]);
                }
              },
              /**
               * remove chart connect
               * @param oAPi
               */
              disConnect: function (oAPi) {
                chart.disConnect(oAPi.getInstance());
              },

              /**
               * set chart theme
               * @param name
               */
              setTheme: function (name) {
                //todo
              },
              /**
               * show loading
               * @param loading
               */
              showLoading: function (loading) {
                //todo
              },
              /**
               * hide loading
               */
              hideLoading: function () {
                //todo
              },

              /**
               * get chart's image
               * @param imgType
               */
              getImage: function (imgType) {
                return chart.getImage(imgType || 'png');
              },
              /**
               * resize chart
               */
              resize: function () {
                chart.resize();
              },
              /**
               * refresh chart
               */
              refresh: function () {
                chart.refresh();
              },
              /**
               * restore to initial state
               */
              restore: function () {
                chart.restore();
              },
              /**
               * clear customer element
               */
              clear: function () {
                chart.clear();
              },
              /**
               * registe Events
               * @param oScope
               * @param events  事件数组:int数值集合
               * @param handler
               */
              registeEvents: function (oScope, events, handler) {
                this.events = {
                  CLICK: events.indexOf(1) !== -1,
                  DBLCLICK: events.indexOf(2) !== -1,
                  DATA_ZOOM: events.indexOf(3) !== -1,
                  LEGEND_SELECTED: events.indexOf(4) !== -1,
                  LEGEND_HOVERLINK: events.indexOf(5) !== -1,
                  HOVER: events.indexOf(6) !== -1,
                  MAP_SELECTED: events.indexOf(7) !== -1,
                  PIE_SELECTED: events.indexOf(8) !== -1
                };
                registerAngularEvent(oScope, handler);
                registerChartEvent();
              },

              unRegisteEvents: function (oScope, events) {

              }
            };
          }

          /**
           * register angular event
           * @param oScope
           * @param handler
           * @returns {*}
           */
          function registerAngularEvent(oScope, handler) {
            eventId = uuid();
            return oScope.$on(eventId, function (event) {
              var args = Array.prototype.slice.call(arguments);
              args.splice(0, 1);
              handler.apply(oScope, args);
            });
          }

          function uuid() {
            return 'xxxxxxxx-xxxx-8xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
              var r = Math.random() * 16 | 0,
                  v = c === 'x' ? r : (r & 3 | 8);
              return v.toString(16);
            });
          }

          /**
           * register chart event
           */
          function registerChartEvent() {
            if (api.events) {
              if (api.events.CLICK) {
                chart.on('click', raiseCallBack);
              }
              // if (api.events.DBLCLICK) {
              //     chart.on(echarts.config.EVENT.DBLCLICK, raiseCallBack);
              // }
              // if (api.events.HOVER) {
              //     chart.on(echarts.config.EVENT.HOVER, raiseCallBack);
              // }
              // if (api.events.DATA_ZOOM) {
              //     chart.on(echarts.config.EVENT.DATA_ZOOM, raiseCallBack);
              // }
              // if (api.events.LEGEND_SELECTED) {
              //     chart.on(echarts.config.EVENT.LEGEND_SELECTED, raiseCallBack);
              // }
              // if (api.events.LEGEND_HOVERLINK) {
              //     chart.on(echarts.config.EVENT.LEGEND_HOVERLINK, raiseCallBack);
              // }
              // if (api.events.MAP_SELECTED) {
              //     chart.on(echarts.config.EVENT.MAP_SELECTED, raiseCallBack);
              // }
              // if (api.events.PIE_SELECTED) {
              //     chart.on(echarts.config.EVENT.PIE_SELECTED, raiseCallBack);
              // }
            }
          }

          /**
           * raise CallBack
           * @param e
           */
          function raiseCallBack(e) {
            scope.$emit(eventId, e);
          }
        }
      };
    })
    .directive('icheck', ['$timeout', function ($timeout) {
      return {
        restrict: 'A',
        require: 'ngModel',
        link: function ($scope, element, $attrs, ngModel) {
          return $timeout(function () {
            var value;
            value = $attrs['value'];

            $scope.$watch($attrs['ngModel'], function () {
              $(element).iCheck('update');
            });

            return $(element).iCheck({
              checkboxClass: 'icheckbox_square-green',
              radioClass: 'iradio_square-green'

            }).on('ifChanged', function (event) {
              if ($(element).attr('type') === 'checkbox' && $attrs['ngModel']) {
                $scope.$apply(function () {
                  return ngModel.$setViewValue(event.target.checked);
                });
              }
              if ($(element).attr('type') === 'radio' && $attrs['ngModel']) {
                return $scope.$apply(function () {
                  return ngModel.$setViewValue(value);
                });
              }
            });
          });
        }
      };
    }])
    .directive('sparkline', function () {
        return {
            restrict: 'A',
            scope: {
                sparkData: '=',
                sparkOptions: '='
            },
            link: function (scope, element, attrs) {
                scope.$watch(scope.sparkData, function () {
                    render();
                });
                scope.$watch(scope.sparkOptions, function(){
                    render();
                });
                var render = function () {
                    $(element).sparkline(scope.sparkData, scope.sparkOptions);
                };
            }
        }
    })
    .directive('autoFocus', ['$timeout',
      function ($timeout) {
        return {
          restrict: 'A',
          link: function (scope, elem) {
            if (scope) {
              $timeout(function () {
                elem[0].focus();
              }, 500);
            }
          }
        };
      }
    ]);




