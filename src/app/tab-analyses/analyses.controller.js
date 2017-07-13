/**
 * Created by Joe on 14/04/2017.
 */
angular.module('webFront')
    .controller('AnalyseController', ['$state', function ($state) {
        var vm = this;
        var arr = $state.current.name.split('.');
        vm.tab = arr.length > 2 ? arr[arr.length - 1] : 'user';

        vm.tabChange = function (url) {
            vm.tab = url;
            $state.go('webFront.analyses.' + url);
        };

        $state.go('webFront.analyses.user');
    }])
    .controller('AnalyseChildController', ['$log', '$scope','$window', '$state', '$q', 'backend', 'helper',
        function ($log, $scope,$window, $state, $q, backend, helper) {
            var version = 0;
            var vm = this ;
            function endwith(str, endstr){     
              var reg=new RegExp(endstr+"$");     
              return reg.test(str);        
            }
            function renderChart(res) {
                var serials = $scope.map(res.serials,function(item){
                    return {
                        type: 'bar',
                        name: item.name,
                        data: item.data
                    }
                });
                var legend = $scope.map(res.serials,function(item){
                    return item.name;
                });
                return {
                    version: version,
                    width: $window.innerWidth * 0.75,
                    // height: 400,
                    color: ['#1ab394', '#ff9446', '#ffce3a', '#00cd8c', '#9f60fd', '#60c0fd', '#fe5d59', '#faf861', '#cbcbcb'],
                    legend: {
                        show: true,
                        padding: [30, 0, 0, 0],
                        data: legend,
                        selectedMode: false
                    },
                    tooltip: {
                        trigger: 'axis',
                        show: true,
                        axisPointer: {
                            type: 'cross'
                        },
                        extraCssText: 'text-align:left'
                    },
                    grid: {
                        left: '3%',
                        right: '4%',
                        // bottom: '3%',
                        containLabel: true
                    },
                    xAxis: {
                        type: 'category',
                        axisLine: {
                            show: true,
                            lineStyle: {
                                color: '#ccc'
                            }
                        },
                        data: res.axis
                    },
                    yAxis: {
                        type: 'value',
                        axisLine: {
                            show: true,
                            lineStyle: {
                                color: '#ccc'
                            }
                        }
                    },
                    series: serials
                };
            }
            var getData = function (name) {
                var q = $q.defer();
                var fut;
                if (endwith(name, "devices")) {
                    backend.statDevice().then(function (data) {
                    version++;
                    vm.config = renderChart(data.data.data);
                    q.resolve(vm.config);
                }, function (data) {
                    helper.error(data.data);
                    q.reject();
                });
                } else if (endwith(name, "maintenance")) {
                    backend.statMaintenance().then(function (data) {
                    version++;
                    vm.config = renderChart(data.data.data);
                    q.resolve(vm.config);
                }, function (data) {
                    helper.error(data.data.data);
                    q.reject();
                });
                } else if (endwith(name, "finance")) {
                     backend.statFinance().then(function (data) {
                    version++;
                    vm.config = renderChart(data.data.data);

                    q.resolve(vm.config);
                }, function (data) {
                    helper.error(data.data);
                    q.reject();
                });
                } else if (endwith(name, "user")) {
                     backend.statCustomer().then(function (data) {
                    version++;
                    vm.config = renderChart(data.data.data);
                    $log.debug(toJson(vm.config));
                    q.resolve(vm.config);
                }, function (data) {
                    helper.error(data.data);
                    q.reject();
                });
                }
                
                return q.promise;
            };
            getData($state.current.name);
        }]);
