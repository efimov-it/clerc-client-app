<template>
    <div class="tab-view">
        <div class="tab-view_tabs">
            <tab v-for="tab in tabs" :ref="'tab'+tab.id" :data="tab" @tabClick="tabClick" />
        </div>
        <scroll :settings="{suppressScrollX : true}" class="tab-view_content">
            <router-view></router-view>
        </scroll>
    </div>
</template>

<script>
import Vue from 'vue'
import route from '../router'
import scroll from 'vue-custom-scrollbar'
Vue.component('scroll', scroll)

import Tab from './tab'
Vue.component('tab', Tab);

export default {
    data () {
        return {
            tabs : [
                {
                    id : 0,
                    name : 'Характеристики судна',
                    path : '/ship-info'
                },
                {
                    id : 1,
                    name : 'Банковская гарантия',
                    path : '/bank-guarantees'
                },
                {
                    id : 2,
                    name : 'Лимиты бюджетных обязательств',
                    path : '/limits'
                },
                {
                    id : 3,
                    name : 'Объекты',
                    path : '/objects'
                },
                {
                    id : 4,
                    name : 'Этапы платежей',
                    path : '/payment-stages'
                },
                {
                    id : 5,
                    name : 'Ключевые события',
                    path : '/key-events'
                },
                {
                    id : 6,
                    name : 'Претензионная работа',
                    path : '/claim-work'
                },
                {
                    id : 7,
                    name : 'Судебная работа',
                    path : '/judical-work'
                },
                {
                    id : 8,
                    name : 'Кассовое исполнение',
                    path : '/cash-execution'
                }
            ],
            path : ''
        }
    },
    methods : {
        tabClick : function(id){
            let context = this;
            
            this.tabs.forEach(function(elem){
                if(elem.id != id){
                    context.$refs['tab'+elem.id][0].selected = false;
                }
                else{
                    if(context.$route.path != context.path+elem.path){
                        route.push(context.path+elem.path);
                    }
                }
            });

        }
    },
    mounted () {
        this.path = this.$route.path;
        this.$refs.tab0[0].selected = true;
        route.push(this.path+'/ship-info');
    }
}
</script>

<style lang="scss">
.table-wrapper{
    border: 1px solid #DCDCE8;
    //padding: 20px 20px 20px 20px;
    border-radius: 5px;
    overflow: hidden;
    position: relative;
    margin-top: 20px;
    /*min-height: 300px;
    max-height: 900px;

    height: 100%;*/

    // & > div {
    //     min-width: 100%;
    // }
}

.tab-view{
    width: 100%;
    height: 100%;

    &_tabs{
        display: flex;
        flex-direction: row;
    }

    &_content{
        width: 100%;
        background-color: #ffffff;
        border-radius: 5px;
        height: calc(100vh - 320px);
        margin-top: -10px;
        position: relative;
        z-index: 1;
        padding: 30px 20px 20px 20px;
        overflow: hidden;
    }
}
.table-button-wrap {
    display: grid;
    grid-template-rows: auto 1fr;
    height: 100%;
}
</style>