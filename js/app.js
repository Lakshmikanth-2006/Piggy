/** Piggy – module, filter and reusable directive. */
(function () {
  'use strict';
  angular.module('piggyApp', [])
    // Formats numbers as Indian rupees, e.g. 125000 -> ₹1,25,000
    .filter('inr', function () {
      return function (n) {
        return '₹' + Number(n || 0).toLocaleString('en-IN', { maximumFractionDigits: 0 });
      };
    })
    // Reusable summary tile: <stat-card label="" value="" tone="">
    .directive('statCard', function () {
      return {
        restrict: 'E',
        scope: { label: '@', value: '=', tone: '@' },
        template: '<div class="stat {{tone}}"><div class="lbl">{{label}}</div><div class="val">{{value | inr}}</div></div>'
      };
    });
})();
