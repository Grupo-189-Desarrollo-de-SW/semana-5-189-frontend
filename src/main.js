import Vue from 'vue'
import App from './App.vue'
import router from './router'
import vuetify from './plugins/vuetify';
import axios from 'axios';
import store from './store';

Vue.config.productionTip = false

const base= axios.create({
  baseURL: "http://localhost:3000"
});

Vue.prototype.$http= base;

new Vue({
  router,
  store,
  vuetify,
  render: h => h(App)
}).$mount('#app')
