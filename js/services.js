/** Piggy – services: storage, notifications and finance logic. */
(function () {
  'use strict';
  var KEY = 'piggy-data-v1';

  function seed() {
    var d = function (back) { var x = new Date(); x.setDate(x.getDate() - back); return x.toISOString().slice(0, 10); };
    return {
      transactions: [
        { id: 1, type: 'income', title: 'Monthly salary', category: 'Salary', amount: 60000, date: d(12) },
        { id: 2, type: 'income', title: 'Logo design gig', category: 'Freelance', amount: 8000, date: d(8) },
        { id: 3, type: 'expense', title: 'Rent', category: 'Housing', amount: 15000, date: d(10) },
        { id: 4, type: 'expense', title: 'Groceries', category: 'Food', amount: 4200, date: d(5) },
        { id: 5, type: 'expense', title: 'Metro card', category: 'Transport', amount: 1200, date: d(3) },
        { id: 6, type: 'expense', title: 'Movie night', category: 'Fun', amount: 900, date: d(1) },
        { id: 7, type: 'saving', title: 'Added to Emergency fund', category: 'Piggy bank', amount: 5000, date: d(6) }
      ],
      goals: [
        { id: 1, name: 'Emergency fund', target: 50000, saved: 5000 },
        { id: 2, name: 'New laptop', target: 80000, saved: 0 }
      ],
      plans: [
        { id: 1, name: 'Index fund SIP', type: 'Mutual fund', monthly: 5000, years: 10, rate: 12 }
      ]
    };
  }

  angular.module('piggyApp')
    // Keeps the app state in memory and mirrors it to localStorage.
    .service('StoreService', function () {
      var data;
      try { data = JSON.parse(localStorage.getItem(KEY)); } catch (e) { data = null; }
      this.data = data || seed();
      var self = this;
      this.persist = function () {
        try { localStorage.setItem(KEY, JSON.stringify(self.data)); } catch (e) { /* storage unavailable */ }
      };
      this.reset = function () {
        angular.copy(seed(), self.data); // keep the same object so views update
        self.persist();
      };
      this.nextId = function (list) {
        return list.reduce(function (m, i) { return Math.max(m, i.id); }, 0) + 1;
      };
    })

    // Success / error notifications.
    .service('ToastService', function ($timeout) {
      this.items = [];
      var items = this.items;
      this.show = function (text, kind) {
        var t = { text: text, kind: kind || 'success' };
        items.push(t);
        $timeout(function () { items.splice(items.indexOf(t), 1); }, 3000);
      };
    })

    // Money calculations used across pages.
    .service('FinanceService', function (StoreService) {
      var data = StoreService.data;
      function sum(type) {
        return data.transactions.filter(function (t) { return t.type === type; })
          .reduce(function (s, t) { return s + t.amount; }, 0);
      }
      this.totals = function () {
        var income = sum('income'), expense = sum('expense'), saving = sum('saving');
        return {
          income: income, expense: expense,
          balance: income - expense - saving,
          saved: data.goals.reduce(function (s, g) { return s + g.saved; }, 0),
          target: data.goals.reduce(function (s, g) { return s + g.target; }, 0)
        };
      };
      // Groups transactions of one type by category with percentage widths.
      this.groupBy = function (type) {
        var map = {}, max = 0;
        data.transactions.forEach(function (t) {
          if (t.type === type) map[t.category] = (map[t.category] || 0) + t.amount;
        });
        var rows = Object.keys(map).map(function (k) { max = Math.max(max, map[k]); return { name: k, total: map[k] }; });
        rows.forEach(function (r) { r.pct = Math.round(r.total / max * 100); });
        return rows.sort(function (a, b) { return b.total - a.total; });
      };
      // Future value of a monthly SIP (compounded monthly).
      this.futureValue = function (p) {
        var r = p.rate / 1200, n = p.years * 12;
        return r ? p.monthly * ((Math.pow(1 + r, n) - 1) / r) * (1 + r) : p.monthly * n;
      };
    });
})();
