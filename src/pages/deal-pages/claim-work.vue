<template>
    <div class="double-table-layout">

        <h2 class="table-title">Претензионная работа по контракту:</h2>
        <div class="table-wrapper">
            <claim-work/>
        </div>

        <h2 class="table-title">Судебная работа по контракту:</h2>
        <div class="table-wrapper">
            <judical-work/>
        </div>
    </div>
</template>

<script>
import Vue from 'vue';
import scroll from 'vue-custom-scrollbar'
Vue.component('scroll', scroll)
import ClaimWork from './claim-work/claim-work';
Vue.component('claim-work', ClaimWork);
import JudicalWork from './claim-work/judical-work';
Vue.component('judical-work', JudicalWork);

export default {}
</script>

<style lang="scss">
.double-table-layout{
    display: grid;
    grid-template-rows: 50px auto 50px auto;
    align-items: center;
    padding-right: 30px;
}
.table-title{
    font-size: 16px;
    font-weight: 600;
}
.double-table-button{
    margin: 20px;
}
</style>