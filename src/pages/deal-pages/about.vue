<template>
    <div class="double-table-layout">

        <h2 class="table-title">Банковская гарантия:</h2>
        <div class="table-wrapper" :settings="{suppressScrollY : true}">
            <bank-guarantees/>
        </div>

        <h2 class="table-title">Лимиты бюджетных обязательств по годам:</h2>
        <div class="table-wrapper" :settings="{suppressScrollY : true}">
            <limit/>
        </div>
    </div>
</template>

<script>
import Vue from 'vue';
import scroll from 'vue-custom-scrollbar'
Vue.component('scroll', scroll)
import BankGuarantees from './about/bank-guarantees';
Vue.component('bank-guarantees', BankGuarantees);
import Limit from './about/limit';
Vue.component('limit', Limit);

export default {}
</script>

<style lang="scss">
.double-table-layout{
    display: grid;
    grid-template-rows: 50px auto 50px auto;
    align-items: center;
}
.table-title{
    font-size: 16px;
    font-weight: 600;
}
</style>