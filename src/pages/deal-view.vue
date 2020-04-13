<template>
    <tab-view @update="update" />
</template>

<script>
import Vue from 'vue'

import TabView from '../components/tab-view'
Vue.component('tab-view', TabView);
export default {
    data (){
        return {

        }
    },
    methods: {
        update(params) {
            this.$emit('update', params);
        }
    }
}
</script>

<style lang="scss">

</style>