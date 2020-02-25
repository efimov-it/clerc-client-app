import Vue from 'vue'
import router from './router'

import App from './App.vue'

let is_auth = (sessionStorage.getItem('token_type')+' ').concat(sessionStorage.getItem('access_token'));

router.push('/login');

new Vue({
  el: '#app',
  router,
  render: h => h(App)
})
