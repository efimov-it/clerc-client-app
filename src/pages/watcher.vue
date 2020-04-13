<template>
    <div class="main-page-wrapper">
        <breadcrumbs @goToMain="goToMain" :data="this.breadCrumbs" />
        <router-view @update="update" class="main-page-content">
        </router-view>
    </div>
</template>

<script>
//
        
import Vue from 'vue';

import BreadCrumbs from '../components/breadcrumbs.vue'
Vue.component('breadcrumbs', BreadCrumbs);

import scroll from 'vue-custom-scrollbar'
Vue.component('scroll', scroll)

import TablesView from '../components/tables-view';
import router from '../router';
Vue.component('tables-view', TablesView);

export default {
    data () {
        return {
            breadCrumbs: [
                {
                    name: 'Объекты',
                    link: '/watcher/objects/'
                }
            ]
        }
    },
    methods:{
        goToMain(){
            this.breadCrumbs = [
                {
                    name: 'Объекты',
                    link: '/watcher/objects/'
                }
            ];
        },
        update(data){
            switch(data.type){
                case 'openObject':
                    this.breadCrumbs.push({
                        name: data.value,
                        link: data.link
                    })
                break;
            }
        }
    },
    created(){
        if ( window.location.pathname.indexOf('objects') == -1 ) {
            router.push('/watcher/objects/');
        }
    },
    updated () {
        if ( window.location.pathname.indexOf('objects') == -1 ) {
            router.push('/watcher/objects/');
        }
        if ( this.$route.path == '/watcher/objects/' & this.breadCrumbs.length > 1) {
            this.breadCrumbs = [
                {
                    name: 'Объекты',
                    link: '/watcher/objects/'
                }
            ];
        }
    }
}

</script>