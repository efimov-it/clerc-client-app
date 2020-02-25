<template>
  <div id="app">
    <app-header>
      <header-buttons @buttonPressed="headerButtonsPressed" :isAdmin="isAdmin" v-if="headerButtons" />
    </app-header>
    <router-view @update="update"></router-view>
  </div>
</template>

<script>
import Vue from 'vue'
import router from './router'

import AppHeader from './components/app-header'
Vue.component('app-header', AppHeader)

import HeaderButtons from './components/header-buttons'
Vue.component('header-buttons', HeaderButtons)

export default {
  name: 'app',
  data () {
    return {
      headerButtons: false,
      isAdmin: false
    }
  },
  methods: {
    update: function(state){
      switch(state){
        case 'logIn':
          this.headerButtons = true;
          this.isAdmin = true;
        break;
        case 'watcher':
          this.headerButtons = true;
          this.isAdmin = false;
          break;
        case 'logOut':
          sessionStorage.clear();
          this.headerButtons = false;
        break;
      }
    },
    headerButtonsPressed: function(button){
      switch(button){
        case 'admin':
          router.push('/users')
          break;

        case 'logOut':
          this.update('logOut');
          router.push('/login');
          break;
      }
    }
  }
}
</script>

<style lang="scss">
*{
  box-sizing: border-box;
  font-family: sans-serif;
  outline: none;
  color: #2E2E2E;
  margin: 0;
  padding: 0;
}
body{
  background-color: #F6F7FB;
}
#app{
  display: grid;
  grid-template-rows: auto 1fr;
  width: 100vw;
  height: 100vh;
}
button{
  cursor: pointer;
}
.link{
  text-decoration: none;
  color: #5067FF;
}
.back-link{
  text-decoration: none;
  color: #5067FF;
  display: flex;
  align-items: center;
  font-size: 14px;
  cursor: pointer;
}
.back-link::before{
  content: '';
  width: 4px;
  height: 6px;
  background-image: url('./assets/back-arrow.svg');
  background-position: center;
  background-repeat: no-repeat;
  background-size: contain;
  margin-right: 5px;
}
.scroll-area {
    height: calc(100vh - 250px) !important;
    width: 100% !important;
    overflow: hidden;
    background-color: #ffffff;
    position: relative;
    display: grid;
    grid-template-rows: auto 1fr;
}

.ps__rail-x{
  width: calc(100% - 15px) !important;

  div{
    margin-bottom: 7.5px;
    height: 15px !important;
  }
}
.ps__rail-y{
  height: calc(100% - 15px) !important;
  
  div{
    margin-right: 7.5px;
    width: 15px !important;
  }
}
.ps__rail-x{
  height: 30px;
}
.ps__rail-y{
  width: 30px;
}
.ps__rail-x, .ps__rail-y{
    background-color: #EFEFF4;
    border-radius: 7px;
    padding: 3px;
    overflow: hidden;

    div{
        background-color: #5361FF !important;
        border-radius: 7.5px;
        cursor: pointer;
    }
}

.add-row {
    background-color: #5361FF;
    border: none;
    color: #ffffff;
    padding: 10px 30px;
    border-radius: 5px;
    width: max-content;
}
.input-dialog{
    display: none;
}

section{
  padding-right: 30px !important;
  padding-bottom: 30px !important;
  position: relative;

  .ps__rail-y{
    // margin-right: -30px;
  }
}
</style>
