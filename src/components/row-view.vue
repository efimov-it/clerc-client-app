<template>
    <div>
        <div :class="'table-view_row-content'+[rowDataBinding.isGrey?' color-grey':'']" :style="columnsWidth">
            <div v-if="!isEdit" v-for="tableCell in rowDataBinding.data" class="table-view_cell" v-on:click="rowClick()">
                <!-- ({{tableCell.id}})  -->
                <span v-if="tableCell.type == 'text' |
                            tableCell.type == 'number' |
                            tableCell.type == 'date' |
                            tableCell.type == 'password' |
                            tableCell.type == 'email' |
                            tableCell.type == 'select'">
                    {{tableCell.value}}
                </span>

                <input :id="'checkBox'+index" v-if="tableCell.type == 'checkbox'" type="checkbox" class="table-view_checkbox" v-model="tableCell.value" v-on:change="checkboxChange(index)">
                <label v-if="tableCell.type == 'checkbox'" :for="'checkBox'+index"></label>

                <div v-if="tableCell.type == 'presentation'">
                    <presentation :data="tableCell.value"/>
                </div>

                <div v-if="tableCell.type == 'files'" class="table-view_cell-links">
                    <a title="Нажмите чтобы посмотреть или скачать" :href="host+file.url" target="_blank" class="table-view_cell-link" v-for="file in tableCell.value">{{file.name}}.{{file.extension}}</a>
                </div>
            </div>
            
            <div  v-if="isEdit" v-for="tableCell in rowDataBinding.data" >
                <!-- ({{tableCell.id}})  -->
                <input  v-if="tableCell.type == 'number'" ref="inputs" class="table-view_cell" :value="tableCell.value ? parseFloat(tableCell.value.replace(/\s/g, '').replace(/,/g, '.')) : ''" :title="tableCell.value" :checked="tableCell.value" type="number" />
                <input  v-if="tableCell.type == 'date'" ref="inputs" class="table-view_cell" :value="[tableCell.value != null ? tableCell.value.split('.')[2]+'-'+tableCell.value.split('.')[1]+'-'+tableCell.value.split('.')[0] : '']" :title="tableCell.value" :checked="tableCell.value" type="date" />
                <input  v-if="tableCell.type == 'password'" ref="inputs" class="table-view_cell" :value="tableCell.value" :title="tableCell.value" :checked="tableCell.value" type="password" />
                <input  v-if="tableCell.type == 'email'" ref="inputs" class="table-view_cell" :value="tableCell.value" :title="tableCell.value" :checked="tableCell.value" type="email" />
                
                <textarea  v-if="tableCell.type == 'text'" ref="inputs" class="table-view_cell-textarea" :title="tableCell.value">{{tableCell.value}}</textarea>
            
                <select v-if="tableCell.type == 'select'" ref="inputs" class="table-view_cell-select">
                    <option v-for="(option, index) in tableCell.keys" :value="index" >{{option}}</option>
                </select>

                <div v-if="tableCell.type == 'presentation'">
                    <presentation :data="tableCell.value"/>
                </div>

                <div v-if="tableCell.type == 'files'" class="table-view_cell-links__edit">
                    <span class="table-view_cell-link" v-for="(file, index) in tableCell.value">{{file.name}}.{{file.extension}}<button title="Удалить файл" class="remove-file" @click="removeFile(file.id, tableCell, index)"></button></span>
                    <button @click="loadFile(tableCell)" class="add-row">Загрузить файл</button>
                </div>
            </div>

            <more-tools @option-click="optionClick" v-if="rowDataBinding.options" :options="rowDataBinding.options" :id="rowDataBinding.id"/>
        </div>
        <!-- <div v-if="inRowAdd == true" class="table-view_add-row" title="Добавить строку" v-on:click="addRow(rowDataBinding.id)"></div>
        <div v-if="inRowAdd == true" class="table-view_add-row" title="Добавить строку" v-on:click="addRow(rowDataBinding.id)"></div> -->

        <div v-if="this.rowData.subTable != undefined" :class="'subtable '+[subTableState == true ? 'active' : '']">
            <div class="table-wrapper color-grey">
                <table-view :ref="'subTable'+this.rowData.id"
                            @addRow="addRowInSubTable"
                            :headers="this.rowData.subTable.headers"
                            :data="this.rowData.subTable.rows"
                            :inRowAdd="inRowAdd"
                            :columns="subTableColumns"></table-view>
            </div>
        </div>
                    
        <input ref="fileDialog" type="file" class="input-dialog" />
    </div>
</template>

<script>
import Vue from 'vue';
import config from '../config';
import TableView from './table-view';
import Axios from 'axios';
Vue.component('table-view', TableView);

import Presentation from './presentation';
Vue.component('presentation', Presentation)

export default {
    props: ['rowData',
            'inRowAdd',
            'index',
            'columnsWidth',
            'subTableColumns',
            'alwaysUpdate'],
    data () {
        return {
            host: '',
            isEdit: false,
            event: null,
            subTableState: false,
            rowDataBinding : [],
            AuthStr: (sessionStorage.getItem('token_type')+' ').concat(sessionStorage.getItem('access_token')),

            dataBeforeEdit: []
        }
    },
    methods : {
        checkboxChange : function(index){
            this.$emit('checkboxChange', index);
        },
        optionClick : function(option){
            switch (option.data.id) {
                case 'edit':
                    this.event = option.data.event;
                    this.isEdit = true;
                break;
                case 'add':
                    option.data.event();
                break;
                case 'editPresentation':
                    option.data.event(option.id);
                break;
                case 'delet':
                    option.data.event(option.id);
                break;
                case 'import':
                    option.event(this.rowDataBinding.id);
                break;
            }
        },
        rowClick : function(){
            if(this.rowData.subTable == undefined){
                this.$emit('rowClick', this.rowDataBinding.id);
            }
            else{
                this.subTableState = !this.subTableState;
            }
        },
        addRow : function(position){
            this.$emit('addRow', position);
        },
        addRowInSubTable(){
            this.$emit('addRowInSubTable', this.rowData.id)
        },
        addInnerDate(){
            this.$emit('addInnerDate', this.rowData.id, this.$refs.newInnerDate[0].value);
        },
        loadFile(tableCell){
            let fileDialog = this.$refs.fileDialog;
            
            fileDialog.onchange = ()=>{
                let formData = new FormData();

                formData.append('file', fileDialog.files[0]);
                
                Axios({
                    method: 'post',
                    url: config.host+'/api/'+this.rowData.data.files.model+'/'+this.rowData.id+'/files',
                    data: formData,
                    headers: { Authorization: this.AuthStr } 
                }).then(resp=>{
                    if(tableCell.value == ''){
                        tableCell.value = [];
                    }
                    tableCell.value.push(resp.data.data);
                }).catch(error => {
                    alert('Ошибка!\r\rНе удалось загрузить файл.\r\rИнформация об ошибке:\r'+error);
                });
                
                fileDialog.value = '';
            }
            fileDialog.click();
        },
        removeFile(id, tableCell, index){
            
            if(confirm('Вы действительно хотите удалить этот файл?')){
                Axios({
                    method: 'delete',
                    url: config.host+'/api/files/'+id,
                    headers: { Authorization: this.AuthStr } 
                }).then().catch(error=>{
                    if(error.response.data.error.messages[0] == 'true'){
                        tableCell.value.splice(index, 1);
                    }
                    else{
                        alert('Ошибка!\r\rНе удалось удалить элемент.\r\rИнформация об ошибке:\r'+error);
                    }
                });
            }
        }
    }
    ,
    created () {
        this.rowDataBinding = this.rowData;
        this.host = config.host;
    },
    beforeUpdate(){
        if(this.$refs.inputs != undefined){
            if(this.isEdit){
                this.$refs.inputs.forEach(input => {
                    this.dataBeforeEdit.push(input.value)
                });
            }
        }
    },
    updated () {
        let context = this;
        if(context.isEdit){
            context.$refs.inputs.forEach((input, i) => {
                input.onkeydown = function(e){
                    if(e.keyCode == 13){
                        context.isEdit = false;
                        let result = [];
                        context.$refs.inputs.forEach((text, index) => {
                            let columnName = Object.keys(context.rowDataBinding.data)[index];

                            if(context.alwaysUpdate == true){
                                result.push(text.value);
                            }
                            else{
                                if(context.rowDataBinding.data[columnName].value != text.value){
                                    result.push(text.value);
                                }
                                else{
                                    result.push(null);
                                }
                            }
                        });
                        
                        context.event(result, context.rowData.id);
                    }
                    
                    if(e.keyCode == 27){
                        context.isEdit = false;
                    }
                }

                if(this.dataBeforeEdit.length > 0){
                    if(input.type == 'date'){
                        input.value = this.dataBeforeEdit[i]    ;
                    }
                }
            });
            this.dataBeforeEdit = [];
        }
    }
}
</script>

<style lang="scss">
.subtable{
    max-height: 0px;
    overflow: hidden;
    opacity: 0;
    transition: all 0.3s;

    &.active{
        max-height: 999999999px;
        opacity: 1;
        padding: 20px;
    }
}

.table-view_checkbox{
    display: none;
}
.table-view_checkbox + label{
    width: 20px;
    height: 20px;
    border: 3px solid #5361FF;
    border-radius: 3px;
    display: block;
    cursor: pointer;
    display: flex;
    align-items: center;

    &::after{
        position: absolute;
        margin-left: 25px;
        content: 'Пользователь не выбран';
        white-space: nowrap;
    }
}
.table-view_checkbox:checked + label{
    background-color: #5361FF;
    background-image: url('../assets/check.svg');
    background-position: center;
    background-repeat: no-repeat;
    background-size: 80%;
    
    &::after{
        content: 'Пользователь выбран';
    }
}
.color-grey{
    background-color: #f5f5f5;
}
.table-view_cell-select{
    margin: 10px 20px;
    padding: 5px 10px;
    border-radius: 5px;
    border: none;
    background-color: #F6F7FB;
    min-height: 50px;
    width: 80%;
}
.table-view_cell-links,
.table-view_cell-links__edit{
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;
    width: calc(100% - 30px);
}
.table-view_cell-links__edit{
    & span{
        display: grid;
        grid-template-columns: calc(100% - 30px) 30px;
    }
}
.remove-file{
    background-color: #ffffff;
    border: none;
    background-image: url('../assets/remove.svg');
    background-repeat: no-repeat;
    background-size: 40%;
    background-position: center;
    width: 35px;
    z-index: 10;
}
.table-view_cell-link{
    overflow: hidden;
    padding: 5px;
    border: 1px solid #5361FF;
    border-radius: 5px;
    margin: 0 5px 5px 0;
}
</style>