(function () {
  'use strict';

  angular
      .module('webFront')
      .factory('httpInterceptor', ['$q', '$cookies', 'locker', 'msg', function ($q, $cookies, locker, msg) {

        return {
          request: function (config) {
            config.headers[msg.HEADER_TOKEN_KEY] = $cookies.get(msg.COOKIE_TOKEN_KEY);
            return config;
          }
          ,
          requestError: function (err) {
            return $q.reject(err);
          },
          response: function (res) {
            return res;
          },
          responseError: function (err) {
            //resolve user token invalid
            //TODO
            return $q.reject(err);
          }
        };
      }])
      .config(['$stateProvider', '$ocLazyLoadProvider', '$urlRouterProvider', '$httpProvider', 'userResolve', '$qProvider', '$provide', routerConfig]);

  /** @ngInject */
  function routerConfig($stateProvider, $ocLazyLoadProvider, $urlRouterProvider, $httpProvider, userResolve, $qProvider,$provide) {
    $qProvider.errorOnUnhandledRejections(false);

    $httpProvider.interceptors.push('httpInterceptor');

    $ocLazyLoadProvider.config({
      debug: false
    });

    $provide.decorator('taOptions', ['taRegisterTool', '$delegate', function(taRegisterTool, taOptions) { // $delegate is the taOptions we are decorating
      taOptions.toolbar = [
        ['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'pre', 'quote'],
        ['bold', 'italics', 'underline', 'strikeThrough', 'ul', 'ol', 'redo', 'undo', 'clear'],
        ['justifyLeft', 'justifyCenter', 'justifyRight', 'indent', 'outdent']
      ];
      return taOptions;
    }]);

    $stateProvider
        .state('login', {
          url: '/login',
          templateUrl: 'app/user/login.html',
          controller: 'LoginController as ctrl'
        })
        .state('webFront', {
          abstract: true,
          url: "/webFront",
          templateUrl: "app/components/common/content.html",
          resolve: userResolve
        })
        .state('webFront.main', {
          url: "/main",
          templateUrl: "app/main/main.html",
          data: {pageTitle: 'Example view'},
          controller: 'BoardController as ctrl'
        })
        .state('webFront.customers', {
          url: '/customers',
          templateUrl: 'app/tab-customers/customers.html',
          controller: 'CustomersController as ctrl'
        })
        .state('webFront.refund', {
          url: '/refund',
          templateUrl: 'app/tab-customers/customers_refund.html',
          controller: 'CustomersController as ctrl'
        })
        .state('webFront.analyses', {
          url: '/analyses',
          // abstract:true,
          templateUrl: 'app/tab-analyses/analyses.html',
          controller: 'AnalyseController as ctrl'
        })
        .state('webFront.analyses.user', {
          url: '/user',
          views: {
            'analyse': {
              templateUrl: 'app/tab-analyses/analyse.user.html',
              controller: 'AnalyseChildController as ctrl'
            }
          }
        })
        .state('webFront.analyses.finance', {
          url: '/finance',
          views: {
            'analyse': {
              url: '/finance',
              templateUrl: 'app/tab-analyses/analyse.finance.html',
              controller: 'AnalyseChildController as ctrl'
            }
          }
        })
        .state('webFront.analyses.maintenance', {
          url: '/maintenance',
          views: {
            'analyse': {
              url: '/maintenance',
              templateUrl: 'app/tab-analyses/analyse.maintenance.html',
              controller: 'AnalyseChildController as ctrl'
            }
          }
        })
        .state('webFront.analyses.devices', {
          url: '/devices',
          views: {
            'analyse': {
              url: '/devices',
              templateUrl: 'app/tab-analyses/analyse.devices.html',
              controller: 'AnalyseChildController as ctrl'
            }
          }
        })
        .state('webFront.devices', {
          url: '/devices',
          templateUrl: 'app/tab-devices/devices.html',
          controller: 'DevicesController as ctrl'
          // resolve: {
          //   loadPlugin: function ($ocLazyLoad) {
          //     return $ocLazyLoad.load([
          //       {
          //         name: 'amap',
          //         files: ['http://webapi.amap.com/maps?v=1.3&key=7cf37d449867d38d4e3a928f7d3387ac']
          //       }
          //
          //     ]);
          //   }
          // }
        })
        .state('webFront.maintenance', {
          url: '/maintenance',
          templateUrl: 'app/tab-maintenance/maintenance.html',
          controller: 'MaintenanceController as ctrl'
        })
        .state('webFront.setting', {
          url: '/setting',
          templateUrl: 'app/tab-setting/setting.html',
          controller: 'SettingController as ctrl'
          // resolve:{
          //   loadPlugin: ['$ocLazyLoad',function ($ocLazyLoad) {
          //     return $ocLazyLoad.load([
          //      'bower_components/angular-file-upload/dist/angular-file-upload.min.js'
          //     ]);
          //   }]
          // }
        })
        .state('webFront.user',{
          url: '/user',
          templateUrl: 'app/user/user.html',
          controller: 'UserController as ctrl'
        });

    $urlRouterProvider.otherwise('/login');
  }

})();
