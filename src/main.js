import Vue from 'vue'
import router from './router'

import App from './App.vue'

    if (sessionStorage.getItem('token_type') == null) {
      router.push('/login');
    }
    else {
      if (window.location.pathname == '/') {
        if (sessionStorage.getItem('role') == 1) {
          router.push('/main');
        }
        else {
          router.push('/watcher');
        }
      }
      else {
        if (sessionStorage.getItem('role') == 1) {
          if(window.location.pathname.indexOf('watcher') >= 0) {
            router.push('/main');
          }
        }
        else {
          if(window.location.pathname.indexOf('watcher') == -1) {
            router.push('/watcher');
          }
        }
      }
    }


new Vue({
  el: '#app',
  router,
  render: h => h(App)
});
