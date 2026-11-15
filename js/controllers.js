/** Piggy – controllers, one per page. */
(function () {
  'use strict';
  var app = angular.module('piggyApp');

  app.controller('MainCtrl', function (StoreService, ToastService) {
    var vm = this;
    vm.view = 'dashboard';
    vm.toasts = ToastService.items;
    vm.pages = [
      { id: 'dashboard', label: 'Dashboard', icon: 'fa-house' },
      { id: 'transactions', label: 'Income & spending', icon: 'fa-receipt' },
      { id: 'piggy', label: 'Piggy bank', icon: 'fa-piggy-bank' },
      { id: 'invest', label: 'Investing', icon: 'fa-chart-line' }
    ];
    vm.go = function (id) { vm.view = id; window.scrollTo(0, 0); };
    vm.resetData = function () {
      if (confirm('Replace all your data with the demo data?')) {
        StoreService.reset();
        ToastService.show('Demo data restored');
      }
    };
  });

  app.controller('DashboardCtrl', function (FinanceService, StoreService) {
    var vm = this;
    vm.t = FinanceService.totals();
    vm.incomeBy = function () { return FinanceService.groupBy('income'); };
    vm.expenseBy = function () { return FinanceService.groupBy('expense'); };
    vm.jarPercent = function () { return vm.t.target ? Math.min(100, Math.round(vm.t.saved / vm.t.target * 100)) : 0; };
    vm.recent = function () {
      return StoreService.data.transactions.slice().sort(function (a, b) {
        return b.date.localeCompare(a.date) || b.id - a.id;
      }).slice(0, 5);
    };
  });

  app.controller('TransactionCtrl', function (StoreService, ToastService) {
    var vm = this, list = StoreService.data.transactions;
    var cats = {
      income: ['Salary', 'Freelance', 'Interest', 'Gift', 'Other income'],
      expense: ['Housing', 'Food', 'Transport', 'Bills', 'Health', 'Fun', 'Shopping', 'Other']
    };
    vm.q = ''; vm.type = ''; vm.sort = '-date'; vm.showForm = false;
    vm.list = function () {
      return list.filter(function (t) { return !vm.type || t.type === vm.type; });
    };
    vm.categories = function () { return cats[vm.form.type] || cats.expense; };
    vm.setType = function (type) { vm.form.type = type; vm.form.category = null; };
    vm.open = function (t) {
      if (t && t.type === 'saving') { ToastService.show('Savings are managed in Piggy bank. You can only delete this entry.', 'error'); return; }
      vm.form = t ? angular.extend({}, t, { date: new Date(t.date) })
                  : { type: 'expense', date: new Date() };
      vm.showForm = true;
    };
    vm.close = function () { vm.showForm = false; };
    vm.save = function (f) {
      if (f.$invalid) return;
      var rec = angular.extend({}, vm.form, { date: vm.form.date.toISOString().slice(0, 10), amount: Number(vm.form.amount) });
      if (rec.id) {
        list[list.findIndex(function (x) { return x.id === rec.id; })] = rec;
        ToastService.show('Transaction updated');
      } else {
        rec.id = StoreService.nextId(list); list.push(rec);
        ToastService.show('Transaction added');
      }
      StoreService.persist(); vm.close();
    };
    vm.remove = function (t) {
      if (!confirm('Delete "' + t.title + '"?')) return;
      list.splice(list.indexOf(t), 1);
      StoreService.persist(); ToastService.show('Transaction deleted');
    };
  });

  app.controller('GoalCtrl', function (StoreService, FinanceService, ToastService) {
    var vm = this, data = StoreService.data;
    vm.goals = data.goals; vm.mode = null; vm.form = {};
    vm.balance = function () { return FinanceService.totals().balance; };
    vm.pct = function (g) { return Math.min(100, Math.round(g.saved / g.target * 100)); };
    vm.openGoal = function () { vm.form = {}; vm.mode = 'goal'; };
    vm.openDeposit = function (g) { vm.target = g; vm.form = {}; vm.mode = 'deposit'; };
    vm.close = function () { vm.mode = null; };
    vm.submit = function (f) {
      if (f.$invalid) return;
      if (vm.mode === 'goal') {
        data.goals.push({ id: StoreService.nextId(data.goals), name: vm.form.name, target: Number(vm.form.target), saved: 0 });
        ToastService.show('Goal created');
      } else {
        var amt = Number(vm.form.amount), room = vm.target.target - vm.target.saved;
        if (amt > vm.balance()) { ToastService.show('Not enough balance. You have ₹' + vm.balance() + ' available.', 'error'); return; }
        if (amt > room) { ToastService.show('This goal needs only ₹' + room + ' more.', 'error'); return; }
        vm.target.saved += amt;
        data.transactions.push({ id: StoreService.nextId(data.transactions), type: 'saving', title: 'Added to ' + vm.target.name,
          category: 'Piggy bank', amount: amt, date: new Date().toISOString().slice(0, 10) });
        ToastService.show('Added to your piggy bank');
      }
      StoreService.persist(); vm.close();
    };
    vm.removeGoal = function (g) {
      if (!confirm('Delete "' + g.name + '"? Money saved in it stays in your transaction history.')) return;
      data.goals.splice(data.goals.indexOf(g), 1);
      StoreService.persist(); ToastService.show('Goal deleted');
    };
  });

  app.controller('InvestCtrl', function (StoreService, FinanceService, ToastService) {
    var vm = this, data = StoreService.data;
    vm.plans = data.plans;
    vm.options = [
      { name: 'Fixed deposit', rate: 7 }, { name: 'Mutual fund', rate: 12 },
      { name: 'Gold', rate: 8 }, { name: 'Stocks', rate: 14 }
    ];
    function blank() { return { name: '', type: vm.options[1], monthly: 5000, years: 10, rate: 12 }; }
    vm.form = blank();
    vm.invested = function (p) { return p.monthly * p.years * 12; };
    vm.future = function (p) { return FinanceService.futureValue(p); };
    vm.save = function (f) {
      if (f.$invalid) { ToastService.show('Fix the highlighted fields', 'error'); return; }
      data.plans.push({ id: StoreService.nextId(data.plans), name: vm.form.name, type: vm.form.type.name,
        monthly: Number(vm.form.monthly), years: Number(vm.form.years), rate: Number(vm.form.rate) });
      StoreService.persist(); ToastService.show('Plan saved');
      vm.form = blank(); f.$setPristine(); f.$setUntouched(); f.$submitted = false;
    };
    vm.remove = function (p) {
      data.plans.splice(data.plans.indexOf(p), 1);
      StoreService.persist(); ToastService.show('Plan deleted');
    };
  });
})();
