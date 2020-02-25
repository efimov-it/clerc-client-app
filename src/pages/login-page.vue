<template>
  <div class="login-form-wrapper">
      <form class="login-form">
          <header class="login-form_header">
              <h2 class="login-form_header-text">
                  CLERC
              </h2>
          </header>
          <div class="login-form_body">
            <h3 class="form-header">Авторизация</h3>
              
            <form-input ref="email" text="E-mail" placeholder="you@example.com" name="email" type="email" width="291px" />
            <form-input ref="password" text="Пароль" placeholder="Введите ваш пароль" name="password" type="password" width="291px" />

            <button v-on:click="login" class="form-submit" type="submit">Войти в систему</button>
          </div>
      </form>
  </div>
</template>

<script>
import Vue from 'vue'
import axios from 'axios'
import config from '../config'

import VueRouter from 'vue-router'
import router from '../router'

import FormInput from '../components/form-input.vue'
Vue.component('form-input', FormInput);
export default {
    methods: {
        login: function(event){
            event.preventDefault();
            if(this.$refs.email.value !== '' && this.$refs.password.value !== ''){
                axios.post(config.host+'/oauth/token',
                "username="+this.$refs.email.value+
                "&password="+this.$refs.password.value+
                "&client_id=1"+
                "&client_secret=c75IGwuqkjrO1RWCE4Ntn4zqpQdpgnEO2wGT9iMT"+
                "&grant_type=password").then(resp=>{
                    sessionStorage.setItem('access_token', resp.data.access_token);
                    sessionStorage.setItem('expires_in', resp.data.expires_in);
                    sessionStorage.setItem('refresh_token', resp.data.refresh_token);
                    sessionStorage.setItem('token_type', resp.data.token_type);

                    const AuthStr = (sessionStorage.getItem('token_type')+' ').concat(sessionStorage.getItem('access_token')); 
                    axios.get(config.host+'/api/profile', {headers: { Authorization: AuthStr } }).then(resp => {
                        
                        sessionStorage.setItem('role', resp.data.data.role);

                        if(resp.data.data.role == 1){
                            this.$emit('update', 'logIn');
                            router.push('/main');
                        }
                        else{
                            this.$emit('update', 'watcher');
                            router.push('/watcher');
                        }

                    }).catch(error => {
                        console.log(error);
                    });
                }).catch((error)=>{
                    alert('Неверный логин или пароль.');
                });
            }
        }
    },
    created(){
        if(sessionStorage.getItem('access_token')){
            const AuthStr = (sessionStorage.getItem('token_type')+' ').concat(sessionStorage.getItem('access_token')); 
            axios.get(config.host+'/api/profile', {headers: { Authorization: AuthStr } }).then(resp => {
                
                sessionStorage.setItem('role', resp.data.data.role);

                if(resp.data.data.role == 1){
                    this.$emit('update', 'logIn');
                    router.push('/main');
                }
                else{
                    this.$emit('update', 'watcher');
                    router.push('/watcher');
                }

            }).catch(error => {
                console.log(error);
            });
        }
    }
}

</script>

<style lang="scss">
.login-form-wrapper{
    display: flex;
    align-items: center;
    justify-content: center;
}
.login-form{
    background-color: #ffffff;
    border-radius: 5px;
    box-shadow: 0px 0px 16px #E7E7F0;
    padding: 25px 30px 45px 30px;

    &_header{
        padding-bottom: 25px;

        &-text{
            color: #5361FF;
            font-size: 28px;
            font-weight: bold;
            cursor: default;
            user-select: none;
        }
    }

    &_body{
        padding: 0 100px;
        display: flex;
        flex-direction: column;

        & > *:not(:last-child){
            margin-bottom: 30px;
        }
    }
}
.form-header{
    font-size: 38px;
    text-align: left;
}
.form-submit{
    background-color: #5361FF;
    color: #ffffff;
    padding: 15px 0;
    width: 100%;
    text-align: center;
    font-size: 16px;
    border: none;
    border-radius: 5px;
    margin: 20px 0 -10px 0;
}
</style>
