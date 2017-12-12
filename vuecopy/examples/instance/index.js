
var app = new Vue({
  el: '#app',
  data: {
    title: 'hello, world, hahaha',
    message: 'this is a msg',
    subData: {
      name: 'nihao a'
    }
  },
  created() {
    var data = this.$data;
    setTimeout(function() {
      app.title = '????';
      console.log(data);
    }, 2000);
  }
});