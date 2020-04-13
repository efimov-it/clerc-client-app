<template>
    <div class="table-view-wrapper">
        <scroll-bar :settings="{suppressScrollY : true}" class="table-view">
            <header v-if="this.data != undefined" class="table-view_headers" :style="'grid-template-columns: '+ [this.headers.length > 2 ? 'repeat('+(this.headers.length - 2)+', minmax(300px, 1fr))' : ''] + ' 40px 500px 40px;'">
                <div ref="header" v-for="(tableHeader, index) in this.headers" :key="index" class="table-view_header no-sort" >
                    <span v-if="tableHeader.value != 'addButton' &
                                tableHeader.value != 'Примечание' &
                                tableHeader.isEdit == false">
                        {{tableHeader.value}}
                        <more-tools @option-click="yearOption" :options="tableHeader.options" :id="tableHeader.id" />
                    </span>

                    <input v-if="tableHeader.value != 'addButton' &
                                tableHeader.value != 'Примечание' &
                                tableHeader.isEdit == true"
                                :value="tableHeader.value"
                                ref="currentYear"
                                type="number"
                                @keyup="yearUpdate(tableHeader.id, $event)"
                                class="table-view_cell" />

                    <button @click="addColumn" v-if="tableHeader.value == 'addButton'" class="addColumn" title="Добавить новый год"></button>
                    <span v-if="tableHeader.value == 'Примечание'">{{tableHeader.value}}</span>
                </div>
            </header>
            <scroll-bar :settings="{wheelPropagation : true, suppressScrollX : true}" v-if="this.data != undefined" v-bind:class="'table-view_body'+[this.firstColumn ? ' table-view_body__first-column' : '']">
                <div v-for="(tableRow, index) in this.data" :key="index" class="table-view_row">
                    <row-view :ref="tableRow.id"
                              :index="index"
                              :rowData="tableRow"
                              @addRow="addRow"

                              :inRowAdd="inRowAdd"
                              :columnsWidth="'grid-template-columns: repeat('+([tableRow.data != undefined ? Object.keys(tableRow.data).length - 2 : 0])+', minmax(300px, 1fr)) 40px 500px 40px;'" />
                </div>
            </scroll-bar>
            <div class="new-row-button-wrapper" v-if="this.data == undefined">
                <button v-if="this.inRowAdd == true" class="new-row-button" v-on:click="addRow()">Добавить новую запись</button>
                <p v-if="this.inRowAdd != true">Нет записей</p>
            </div>
            <div class="new-row-button-wrapper" v-if="this.data.length == 0">
                <button v-if="this.inRowAdd == true & this.data.length == 0" class="new-row-button" v-on:click="addRow()">Добавить новую запись</button>
                <p v-if="this.inRowAdd != true & this.data.length == 0">Нет записей</p>
            </div>
        </scroll-bar>
    </div>
</template>

<script>
import Vue from 'vue'
import ScrollBar from 'vue-custom-scrollbar' 
Vue.component('scroll-bar', ScrollBar)

import RowView from '../components/row-view'
Vue.component('row-view', RowView);

import MoreTools from '../components/more-tools'
Vue.component('more-tools', MoreTools);

export default {
    props: [ 'data', 'headers', 'firstColumn', 'inRowAdd'],
    data () {
        return {
            rowsCount: 0
        }
    },
    methods: {
        yearOption(data){
            this.$emit('yearOption', data);
        },
        addRow : function(position){
            this.$emit('addRow', position);
        },
        addColumn(){
            this.$emit('addColumn');
        },
        yearUpdate(id, event){
            if(event.code == 'Enter'){
                this.$emit('yearUpdate', id);
            }
        }
    },
    created () {
        if(this.data != undefined){
            this.rowsCount = this.data.length;
        }
        else{
            this.rowsCount = 0;
        }
    },
    updated () {
        if(this.rowsCount < this.data.length){
            this.$emit('update');
        }
    }
}
</script>

<style lang="scss">
.table-view-wrapper{
    width: 100%;
    min-height: 130px;
    overflow: hidden;
    position: relative;

    height: 100%;
}
.table-view{
    height: 100%;
    /*background-color: #ffffff;*/
    display: grid;
    grid-template-rows: auto 1fr;
    border-radius: 5px;
    position: relative;

    &_headers, &_row-content{
        display: grid;
        border-bottom: 1px solid #DCDCE8;
    }
    &_header{
        padding: 30px 40px;
        font-size: 16px;
        font-weight: bold;
        color: #2E2E2E;
        cursor: pointer;
        position: relative;
        display: flex;
        align-items: center;
    }

    &_body{
        position: relative;
        min-height: 130px;
        padding-bottom: 30px;
        
        &__first-column{

            .table-view_cell:first-child{
                color: #5361FF;
            }
        }
    }

    &_row{
        position: relative;
    }
    &_row-content{
        transition: box-shadow 0.3s;
        cursor: pointer;
        min-height: 70px;

        &:hover{
            box-shadow: 0px 0px 10px #DCDCE3CC;

            & ~ .table-view_add-row{
                opacity: 1;
            }
        }
    }

    &_add-row{
        width: 20px;
        height: 20px;
        margin: -10px 0 0 0px;
        position: absolute;
        border-radius: 10px;
        border: 1px solid #565AFF;
        background-color: #ffffff;
        cursor: pointer;

        background-image: url('../assets/add-row.svg');
        background-position: center;
        background-repeat: no-repeat;
        background-size: 60%;

        opacity: 0;
        transition: opacity 0.3s;

        &:nth-child(2){
            top: 0;
        }
        
        &:hover{
            opacity: 1;
        }
    }


    &_cell{
        padding: 20px 40px;
        font-size: 16px;
        color: #2E2E2E;
        /*max-height: 35px;*/
        transition: all 0.3s;
        overflow: hidden;

        &:hover{
            /*max-height: 500px;*/
        }

        &__edit{
            display: none;
        }
    }

    &_input-cell__not-edit{
        display: none;
    }
}
input.table-view_cell{
    margin: 10px 20px;
    padding: 5px 10px;
    border-radius: 5px;
    border: none;
    background-color: #F6F7FB;
    min-height: 50px;
    width: calc(100% - 40px);
}
.new-row-button-wrapper {
    width: calc(100vw - 150px);
    margin: 150px 0 40px 0;
    position: sticky;
    display: flex;
    align-items: center;
    justify-content: center;
    grid-row: 2/3;
}
.new-row-button {
    background-color: #5361FF;
    border: none;
    color: #ffffff;
    padding: 10px 30px;
    border-radius: 5px;
}
.addColumn {
    width: 30px;
    height: 30px;
    position: absolute;
    margin-left: -20px;
    border: 1px solid #5361ff;
    background-color: #ffffff;
    border-radius: 5px;
    background-image: url('../assets/add-row.svg');
    background-position: center;
    background-repeat: no-repeat;
}
</style>