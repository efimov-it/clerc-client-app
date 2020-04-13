<template>
    <div class="table-view-wrapper">
        <scroll-bar :settings="{suppressScrollY : true}" class="table-view">
            <header v-if="this.data != undefined" class="table-view_headers" :style="columns?columns:'grid-template-columns: repeat('+(this.headers.length)+', minmax(300px, 1fr)) 40px;'">
                <div ref="header"
                     v-for="(tableHeader, index) in this.headers"
                     :key="index"
                     :class="'table-view_header' + (noSort ? ' no-sort': '')"
                     v-on:click="!noSort ? sort(index) : ''">
                    {{tableHeader}}
                </div>
            </header>
            <scroll-bar :settings="{wheelPropagation : true, suppressScrollX : true}" v-if="this.data != undefined" v-bind:class="'table-view_body'+[this.firstColumn ? ' table-view_body__first-column' : '']">
                <div v-for="(tableRow, index) in this.data"
                     :key="index"
                     class="table-view_row">
                    <row-view :ref="tableRow.id"
                              :index="index"
                              :rowData="tableRow"
                              :alwaysUpdate="alwaysUpdate"
                              
                              @checkboxChange="checkboxChange"
                              @rowClick="rowClick"
                              @addRow="addRow"
                              @addRowInSubTable="addRowInSubTable"

                              @addInnerDate="addInnerDate"
                              :inRowAdd="inRowAdd"
                              :columnsWidth="columns?columns:'grid-template-columns: repeat('+([tableRow.data != undefined ? Object.keys(tableRow.data).length : 0])+', minmax(300px, 1fr)) 40px;'"
                              :subTableColumns="subTableColumns"/>
                </div>
                <div class="new-row-button-wrapper" v-if="this.inRowAdd == true">
                    <button v-if="manyQueries != -1" class="add-row" @click="loadNewData" style="margin-right: 30px;">Загрузить ещё...</button>
                    <button class="new-row-button" v-if="role == 1" v-on:click="addRow()">Добавить новую запись</button>
                </div>
            </scroll-bar>
            <!-- <div class="new-row-button-wrapper" v-if="this.data == undefined">
                <button v-if="this.inRowAdd == true" class="new-row-button" v-on:click="addRow()">Добавить новую запись</button>
                <p v-if="this.inRowAdd != true">Нет записей</p>
            </div>
            <div class="new-row-button-wrapper" v-if="this.data != undefined & this.data.length == 0">
                <button v-if="this.inRowAdd == true & this.data.length == 0" class="new-row-button" v-on:click="addRow()">Добавить новую запись</button>
                <p v-if="this.inRowAdd != true & this.data.length == 0">Нет записей</p>
            </div> -->
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
    props: [ 'data',
             'headers',
             'firstColumn',
             'inRowAdd',
             'columns',
             'subTableColumns',
             'groupBy',
             'sortBy',
             'alwaysUpdate',
             'noSort'],
    data () {
        return {
            rowsCount: 0,
            currentSort: '',
            sortDirection: -1,
            sortedData: [],
            grouped: false,
            sortByGroup: false,
            manyQueries: -1,
            role: 0
        }
    },
    methods: {
        checkboxChange: function(index){
            this.$emit('checkboxChange', index);
        },
        rowClick : function(id){
            this.$emit('rowClick', id);
        },
        addRow : function(position){
            this.$emit('addRow', position);
        },
        addRowInSubTable(id){
            this.$emit('addRowInSubTable', id);
        },
        sort (index){
            let currentColumn = Object.keys(this.data[0].data)[index];
            //Включение, переключение и отключение сортировки
            if(this.sortedData.length == 0){
                //Записываем исходный массив в отдельную переменную
                this.data.forEach(elem=>{
                    this.sortedData.push(elem);
                });
            }
            else{
                //Если есть группа
                if(this.grouped){
                    //Если была сортировка внутри группы
                    if(this.sortByGroup){
                        this.sortDirection = this.sortDirection == 1 ? -1 : 1;

                        if(this.sortDirection == -1){
                            this.$refs.header[index].className += ' table-view_header__sorted';
                            this.$refs.header[index].classList.remove('table-view_header__sorted-up');
                            this.$refs.header[index].className += ' table-view_header__sorted-down';
                        }
                        else{
                            this.$refs.header[index].className += ' table-view_header__sorted';
                            this.$refs.header[index].className += ' table-view_header__sorted-up';
                            this.$refs.header[index].classList.remove('table-view_header__sorted-down');
                        }

                    }
                    else{
                        if(this.sortDirection == -1){
                            sortOff(this);
                            return;
                        }
                    }
                }
                //Если группы нету
                else{
                    if(this.sortDirection == 1){
                        this.sortDirection == 0;
                    }
                    else{
                        //Отключаем сортировку
                        sortOff(this);
                        return;
                    }
                }
            }

            function sortOff(context){
                if(context.sortDirection == -1){
                    context.$emit('sort', context.sortedData);
                    context.currentSort = '';
                    if(context.sortBy != currentColumn){
                        context.grouped = false;
                    }

                    context.sortedData = [];

                    context.$refs.header.forEach(elem => {
                        elem.classList.remove('table-view_header__sorted-up');
                        elem.classList.remove('table-view_header__sorted-down');
                        elem.classList.remove('table-view_header__sorted');
                    });
                }
            }
            
            let sortFunc;

            //Выбор функции сортировки исходя из типа данных столбца
            if(this.data[0].data[currentColumn].type == 'number'){
                sortFunc = (a, b) => {
                    console.log(parseFloat(a.data[currentColumn].value.replace(/\s/g, '')), parseFloat(b.data[currentColumn].value.replace(/\s/g, '')));
                    
                    return this.sortDirection * parseFloat(a.data[currentColumn].value.replace(/\s/g, '')) - parseFloat(b.data[currentColumn].value.replace(/\s/g, ''));
                }
            }
            else{
                if(this.data[0].data[currentColumn].type == 'date'){
                    sortFunc = (a, b) => {
                        if(a.data[currentColumn].value != ''){
                            a = a.data[currentColumn].value.split('.');
                            a = a[2]+'-'+a[1]+'-'+a[0];
                        }
                        else{
                            a = 0;
                        }

                        if(b.data[currentColumn].value != ''){
                            b = b.data[currentColumn].value.split('.');
                            b = b[2]+'-'+b[1]+'-'+b[0];
                        }
                        else{
                            b = 0;
                        }
                        let diference = ((new Date(a)).getTime()/86400000) - ((new Date(b)).getTime()/86400000);
                        return this.sortDirection * diference / Math.abs(diference);
                    }
                }
                else{
                    if(this.sortDirection == -1){
                        sortFunc = function(a, b){
                            if(a.data[currentColumn].value > b.data[currentColumn].value){
                                return 1;
                            }
                            if(a.data[currentColumn].value < b.data[currentColumn].value){
                                return -1;
                            }
                            return 0;
                        }
                    }
                    else{
                        sortFunc = function(a, b){
                            if(a.data[currentColumn].value < b.data[currentColumn].value){
                                return 1;
                            }
                            if(a.data[currentColumn].value > b.data[currentColumn].value){
                                return -1;
                            }
                            return 0;
                        }
                    }
                }
            }

            if(this.groupBy != undefined & this.sortBy != undefined){
                if(currentColumn == this.sortBy){
                    /////////////////////////////////////////////
                    //Сортировка даты для сгруппированных строк//
                    /////////////////////////////////////////////
                    if(this.grouped){
                        let groupedData = [];
                        let currentGroup = null;
                        let tmp;
                        this.data.forEach((elem, i)=>{
                            if(currentGroup != null){
                                if(elem.data[this.groupBy].value == currentGroup){
                                    tmp.rows.push(elem);

                                    if(i == this.data.length - 1){
                                        groupedData.push(tmp);
                                    }
                                }
                                else{
                                    addNewGroup(this);
                                }
                            }
                            else{
                                addNewGroup(this);
                            }

                            function addNewGroup(context){
                                if(tmp != undefined){
                                    groupedData.push(tmp);
                                }

                                tmp = {
                                    groupName: elem.data[context.groupBy].value,
                                    rows: []
                                };
                                
                                tmp.rows.push(elem);
                                currentGroup = elem.data[context.groupBy].value;

                                if(i == context.data.length - 1){
                                    groupedData.push(tmp);
                                }
                            }
                        });

                        groupedData.forEach(elem=>{
                            elem.rows.sort(sortFunc);
                        });
                        
                        let resultData = [];

                        groupedData.forEach(group=>{
                            group.rows.forEach(row=>{
                                resultData.push(row);
                            });
                        });

                        this.$emit('sort', resultData);
                    }
                    else{
                        runSimpleSort(this);
                    }
                }
                else{
                    runSimpleSort(this);
                }
            }
            else{
                runSimpleSort(this);
            }
            
            if(this.groupBy == currentColumn){
                this.grouped = true;
                this.sortByGroup = false;
            }
            else if(this.grouped == true){
                if(this.sortBy != currentColumn){
                    this.grouped = false;
                }
                else{
                    this.sortByGroup = true;
                }
            }

            function runSimpleSort(context){
                let i = 0;
                for(let item in context.data[0].data){
                    if(i == index){

                        context.$refs.header.forEach(elem => {
                            elem.classList.remove('table-view_header__sorted-up');
                            elem.classList.remove('table-view_header__sorted-down');
                            elem.classList.remove('table-view_header__sorted');
                        });

                        let sortArray;
                        if(context.sortedData.length > 0 & context.sortDirection == -1) {
                            context.currentSort = item;
                            sortArray = context.data.sort(sortFunc);
                            context.$refs.header[index].className += ' table-view_header__sorted';
                            context.$refs.header[index].classList.remove('table-view_header__sorted-up');
                            context.$refs.header[index].className += ' table-view_header__sorted-down';
                            context.sortDirection = 1;
                        }
                        else{
                            sortArray = context.data.sort(sortFunc);
                            context.$refs.header[index].className += ' table-view_header__sorted';
                            context.$refs.header[index].classList.remove('table-view_header__sorted-down');
                            context.$refs.header[index].className += ' table-view_header__sorted-up';
                            context.sortDirection = -1;
                        }

                        context.$emit('sort', sortArray);
                    }
                    i++;
                }
            }
        },
        loadNewData(){
            this.$emit('loadData', this.manyQueries);
        },

        addInnerDate (id, value) {
            this.$emit('addInnerDate', id, value);
        }
    },
    created () {
        this.role = sessionStorage.getItem('role') ? sessionStorage.getItem('role') : 0;
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

    &_headers,&_row-content{
        display: grid;
        // min-width: 100%;
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

        &:not(.no-sort)::after{
            content: ' ';
            position: absolute;
            width: 15px;
            height: 15px;
            right: 10px;
            border-radius: 7.5px;
            background-color: #5361FF;
            background-position: center;
            background-repeat: no-repeat;
            background-size: contain;
            transition: all 0.3s;
        }

        &__sorted{
            
            &:not(.no-sort)::after{
                background-image: url('../assets/sort-arrow.svg');
                background-color: transparent;
            }
            
            &-up::after{
                transform: rotate(180deg);
            }

            &-down::after{
                transform: rotate(0deg);
            }
        }
    }

    &_body{
        // display: grid;
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
        // display: inline-block;
        position: relative;
        border-right: 1px solid #DCDCE8;
        // border-top: 1px solid #DCDCE8;
        // border-bottom: 1px solid #dcdce8;
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

        &-textarea{
            border: none;
            background-color: #f6f7fb;
            padding: 5px 10px;
            border-radius: 5px;
            min-width: calc(100% - 20px);
            max-width: calc(100% - 20px);
            margin: 10px !important;
            line-height: 1.3rem;
            height: 100px !important;
        }

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
</style>