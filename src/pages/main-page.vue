<template>
    <div class="main-page-wrapper">
        <breadcrumbs @updateLinks="updateLinks" @goToMain="goToMain" :data="breadCrumbs" />
        <div class="main-page-content">
            <router-view @update="update"></router-view>
        </div>
    </div>
</template>

<script>
import Vue from 'vue';

import BreadCrumbs from '../components/breadcrumbs.vue';
Vue.component('breadcrumbs', BreadCrumbs);
export default {
    data (){
        return {
            breadCrumbs: [
                {
                    name: 'Контракты',
                    link: {path: '/main/'}
                }
            ]
        }
    },
    methods: {
        update : function(params){
            switch(params.event){
                case 'openDeal':
                    this.breadCrumbs.push({name: params.name, link: params.link});
                break;
            }
        },
        goToMain : function(){
            this.breadCrumbs = [{name:'Контракты', link: {path: '/main/'}}];
        },
        updateLinks(index){
            this.breadCrumbs.splice(index + 1, this.breadCrumbs.length - index - 1);
        }
    },

    mounted(){
        this.$emit('update', 'logIn');
    },

    updated () {
        if ( (this.$route.path == '/main/' || this.$route.path == '/main') & this.breadCrumbs.length > 1) {
            this.breadCrumbs =  [
                {
                    name: 'Контракты',
                    link: {path: '/main/'}
                }
            ]
        }
    }
}
</script>

<style lang="scss">
.main-page-wrapper{
    padding: 25px 60px;
    width: 100vw;
}
.main-page-content{
    height: calc(100vh - 250px);
    margin: 40px 0;
    position: relative;
    //box-shadow: 0px 0px 16px #E7E7F0;
}
</style>