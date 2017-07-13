/**
 * Created by Joe on 17/04/2017.
 */
'use strict';

angular.module('webFront')
    .filter('offset', function () {
      return function (input, start) {
        return input.slice(parseInt(start, 10));
      };
    })
    .filter('timmer', function () {
      return function (t) {
        if (t) {
          var obj = {
            d: ~~(t / 86400),
            h: ~~(t / 3600 % 24),
            m: ~~(t % 3600 / 60),
            s: ~~(t % 3600 % 60)
          }, output = '';
          for (var key in obj) {
            output += (obj[key] ? obj[key] + key + (key === 's' ? '' : "'") : '');
          }
          return output;
        } else {
          return;
        }
      };
    })
    .filter('numater', function () {
      return function (num) {
        var val = "";
        if (num && num.length>10) {
          if(num.length > 10){
            return num.substr(0,num.length-8) + '****' + num.substr(-4);
          }
          if(num.length >=6 && num.length < 10){
            return num.substr(0,num.length-5) + '****' + num.substr(-1);
          }
        }
      };
    });
;
