<template>
    <div class="table-button-wrap">
        <div><button class="add-row" v-on:click="addLimit()">Добавить новый лимит</button></div>
        <scroll-bar class="table-wrapper">
            <header class="table-view_headers limit-header" style="display: inline-grid;min-width: 100%;">
                <div :style="this.years.length > 0 ? 'display: grid;'+
                                                     'grid-template-columns: repeat('+this.years.length+', minmax(200px, 1fr))' : ''">
                    <span v-for="(year, i) in this.years"
                          :key="i"
                          class="table-view_header no-sort">
                        {{year.value}}
                        <more-tools @option-click="yearOption"
                                    :options="year.options"
                                    :id="year.id"
                                    class="header-more-tools" />
                    </span>
                </div>
                <button @click="addYear" class="addColumn" style="position: relative;" title="Добавить новый год"></button>
                <span class="table-view_header no-sort">Примечание</span>
            </header>
            <div class="table-view_body">
                <div v-for="(row, i) in this.data" :key="i">
                    <div v-if="row.isEdit == false"
                         class="table-view_row"
                         :style="row.years.length > 0 ? 'min-width: 100%;'+
                                                        'border-bottom: 1px solid #dcdce8;'+
                                                        'display: inline-grid;'+
                                                        'grid-template-columns: repeat('+row.years.length+', minmax(200px, 1fr)) 60px 500px' : ''">
                        <span class="table-view_cell"
                              v-for="(cell, i) in row.years"
                              :key="i">
                                {{cell.value != '' ? parseFloat(cell.value).toLocaleString() : ''}}
                        </span>
                        <span></span>
                        <span class="table-view_cell" style="padding-right: 90px">{{row.note}}</span>
                
                        <more-tools @option-click="limitOption"
                                    :options="row.options"
                                    :id="row.years"
                                    style="margin-right: 20px" />
                    </div>

                    <div v-if="row.isEdit == true" 
                         class="table-view_row" 
                         :style="row.years.length > 0 ? 'min-width: 100%;'+
                                                        'border-bottom: 1px solid #dcdce8;'+
                                                        'display: inline-grid;'+
                                                        'grid-template-columns: repeat('+row.years.length+', minmax(200px, 1fr)) 60px 500px' : ''">
                        <input
                            v-for="(cell, i) in row.years"
                            :key="i"
                            :value="cell.value"
                            ref="editInputs"
                            :cell-id="cell.id"
                            type="number"
                            class="table-view_cell" />
                        <span></span>
                        <textarea class="table-view_cell-textarea"
                                  ref="editInputs"
                                  v-model="row.note"></textarea>
                    </div>
                </div>
            </div>
            <!-- <limit-view ref="table" :headers="headers" @yearOption="yearOption" @addColumn="addYear" @yearUpdate="yearUpdate" @addRow="addLimit" @update="update" :data="data" /> -->
        </scroll-bar>
        <div :class="'modal-wrapper '+[modalWindowIsShow?' modal-wrapper__active':'']">
            <div class="modal-dark-background"></div>
            <div class="modal-window modal-window-limits">
                <header class="modal-window_header">Укажите год для лимита <button @click="close" class="modal-window_close"></button></header>
                <div class="limit-year-form">
                    <input type="number" ref="yearInput" class="table-view_cell add-limit-year_input" />
                    <button class="add-row add-limit-year_button" @click="modalEvent ? modalEvent() : ''">ОК</button>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import Vue from 'vue';
import config from '../../../config';
import axios from 'axios';
import ScrollBar from 'vue-custom-scrollbar';
Vue.component('scroll-bar', ScrollBar);

import LimitView from '../../../components/limit-view';
Vue.component('limit-view', LimitView);

export default {
    data () {
        return {
            modalWindowIsShow: false,
            modalEvent: null,
            editYearId: null,
            editLimitId: null,
            isEdit: false,
            years: [],
            data: [],
            AuthStr: (sessionStorage.getItem('token_type')+' ').concat(sessionStorage.getItem('access_token'))
        }
    },
    methods: {

        close(){
            this.modalWindowIsShow = false;
            this.$refs.yearInput.value = '';
            this.modalEvent = null;
        },

        //Добавить столбец
        addYear(){
            if(!this.isEdit){
                this.modalWindowIsShow = true;
                this.modalEvent = () => {
                    if(this.$refs.yearInput.value != ''){
                        let isAdded = false;
                        this.years.find(year=>{
                            if(year.value == this.$refs.yearInput.value){
                                isAdded = true;
                            }
                        });

                        if(isAdded){
                            alert(this.$refs.yearInput.value+' год уже записан в лимиты.');
                            return;
                        }
                        else{
                            let newYear = this.$refs.yearInput.value;
                            let dataQuery = {
                                data: []
                            };
                            this.data.forEach(limit=>{
                                dataQuery.data.push({
                                    contract_id: this.$router.history.current.params.id,
                                    note: limit.note,
                                    price: 'x',
                                    years: newYear
                                });
                            });
                            axios({
                                method: 'post',
                                data: dataQuery,
                                url: config.host+'/api/limitBudgetaryObligations/multiple',
                                headers: { Authorization: this.AuthStr }
                            }).then(resp=>{
                                this.years.push({
                                    id: this.years.length,
                                    value: newYear,
                                    options: [
                                        {
                                            id: 'edit',
                                            text: 'Редактировать',
                                            event: this.editYear
                                        },
                                        {
                                            id: 'delet',
                                            text: 'Удалить',
                                            event: this.deletYear
                                        }
                                    ]
                                });

                                resp.data.data.forEach((newCell, i)=>{
                                    this.data[i].years.push({
                                        id: newCell.id,
                                        year: newYear,
                                        value: ''
                                    });
                                });

                                this.modalWindowIsShow = false;
                                this.$refs.yearInput.value = '';
                            });
                            return;
                        }
                    }else{
                        alert('Поле не заполнено.\r\rПожалуйста, заполните поле и повторите попытку');
                    }
                };
            }
            else{
                alert('Пожалуйста, закончите редактирование таблицы и повторите попытку.')
            }
        },

        //Редактировать столбец
        editYear(){
            if(this.$refs.yearInput.value != ''){
                let isAdded = false;
                this.years.find(year=>{
                    if(year.value == this.$refs.yearInput.value){
                        isAdded = true;
                    }
                });

                if(isAdded){
                    alert(this.$refs.yearInput.value+' год уже записан в лимиты.');
                    return;
                }
                else{
                    let newYear = this.$refs.yearInput.value;
                    let dataQuery = {
                        data: []
                    };
                    this.data.forEach(limit=>{
                        dataQuery.data.push({
                            id: limit.years[this.editYearId].id,
                            years: newYear
                        });
                    });

                    if(this.data.length > 0){
                        axios({
                            method: 'put',
                            data: dataQuery,
                            url: config.host+'/api/limitBudgetaryObligations/multiple',
                            headers: { Authorization: this.AuthStr }
                        }).then(()=>{
                            this.years[this.editYearId].value = newYear;

                            this.data.forEach(limit=>{
                                limit.years[this.editYearId].year = newYear;
                            });

                            this.modalWindowIsShow = false;
                            this.$refs.yearInput.value = '';
                        });
                    }
                    else{
                        this.years[this.editYearId].value = newYear;

                        this.modalWindowIsShow = false;
                        this.$refs.yearInput.value = '';
                    }
                    return;
                }
            }else{
                alert('Поле не заполнено.\r\rПожалуйста, заполните поле и повторите попытку');
            }
        },
        
        //Удаляем столбец
        deletYear(id){
            if(!this.isEdit){
                if(confirm('Вы действительно хотите удалить '+this.years[id].value+' год?')){
                    let dataQuery = {
                        data: []
                    };
                    this.data.forEach(limit=>{
                        dataQuery.data.push({
                            id: limit.years[id].id
                        });
                    });

                    if(this.data.length > 0){
                        axios({
                            method: 'delete',
                            data: dataQuery,
                            url: config.host+'/api/limitBudgetaryObligations/multiple',
                            headers: { Authorization: this.AuthStr }
                        }).catch(error=>{
                            if(error.response.data.error.messages[0] == 'true'){
                                this.years.splice(id, 1);
                                if(this.years.length == 0){
                                    this.data = [];
                                }
                                else{
                                    this.data.forEach(limit=>{
                                        limit.years.splice(id, 1);
                                    });
                                }

                                this.years.forEach((year, i)=>{
                                    year.id = i;
                                });
                            }
                        });
                    }
                    else{
                        this.years.splice(id, 1);

                        this.years.forEach((year, i)=>{
                            year.id = i;
                        });
                    }
                }
            }
            else{
                alert('Пожалуйста, закончите редактирование таблицы и повторите попытку.')
            }
        },

        yearOption(data){
            switch(data.data.id){
                case 'edit':
                    if(!this.isEdit){
                        this.editYearId = data.id;
                        this.$refs.yearInput.value = this.years[data.id].value;
                        this.modalWindowIsShow = true;
                        this.modalEvent = data.data.event;
                    }
                    else{
                        alert('Пожалуйста, закончите редактирование таблицы и повторите попытку.')
                    }
                    break;
                case 'delet':
                    data.data.event(data.id);
                    break;
            }
        },

        addLimit(){
            if(!this.isEdit){
                if(this.years.length > 0){
                    this.isEdit = true;
                    let noteIndex = 0;
                    this.data.forEach(elem=>{
                        if(elem.note.indexOf('Примечание №') > -1){
                            let tmp = parseInt(elem.note.substring(12)+'jbhmn');
                            if(typeof tmp == 'number'){
                                if(tmp > noteIndex){
                                    noteIndex = tmp;
                                }
                            }
                        }
                    });

                    let dataQuery = {
                        data: []
                    }

                    this.years.forEach(year=>{
                        dataQuery.data.push({
                            contract_id: this.$router.history.current.params.id,
                            note: 'Примечание №'+(noteIndex + 1),
                            price: 'x',
                            years: year.value
                        });
                    });

                    axios({
                        method: 'post',
                        data: dataQuery,
                        url: config.host+'/api/limitBudgetaryObligations/multiple',
                        headers: { Authorization: this.AuthStr }
                    }).then(resp=>{
                        let tmpLimit = {
                            note: resp.data.data[0].note,
                            years: [],
                            isEdit: true,
                            options: [
                                {
                                    id: 'edit',
                                    text: 'Редактировать',
                                    event: this.editLimit
                                },
                                {
                                    id: 'delet',
                                    text: 'Удалить',
                                    event: this.deletLimit
                                }
                            ]
                        }
                        resp.data.data.forEach(limit=>{
                            let year = {
                                id: limit.id,
                                year: limit.years,
                                value: limit.price != 'x' ? limit.price : ''
                            };
                            tmpLimit.years.push(year);
                        });

                        this.data.push(tmpLimit);

                        this.editLimitId = this.data.length -1;
                        this.editLimit();
                    });
                }
                else{
                    alert('Для добавления нового лимита, необходимо добавить хотябы один год.')
                }
            }
            else{
                alert('В данный момент вы редактируете таблицу.\rЧтобы добавить новый лимит, необходимо звершить редактирование.')
            }
        },

        editLimit(){
            setTimeout(()=>{
                let inputs = this.$refs.editInputs;

                inputs.forEach(input=>{
                    input.onkeydown = (e)=>{
                        if(e.keyCode == 13){
                            if(inputs[inputs.length - 1].value.replace(/\r?\n/g, "").trim() != ''){
                                let unicNote = true;
                                
                                this.data.forEach((limit, i)=>{
                                    if(limit.note == inputs[inputs.length - 1].value & i != this.editLimitId){
                                        unicNote = false;
                                    }
                                });
                                
                                if(unicNote){
                                    let dataQuery = {
                                        data: []
                                    };
                                    this.data[this.editLimitId].years.forEach((year, i)=>{
                                        dataQuery.data.push({
                                            id: year.id,
                                            note: inputs[inputs.length - 1].value,
                                            price: inputs[i].value == '' ? 'x' : inputs[i].value
                                        });
                                    });
                                    
                                    axios({
                                        method: 'put',
                                        data: dataQuery,
                                        url: config.host+'/api/limitBudgetaryObligations/multiple',
                                        headers: { Authorization: this.AuthStr }
                                    }).then(()=>{
                                        this.data[this.editLimitId].years.forEach((year, i)=>{
                                            year.value = inputs[i].value;
                                        });
                                        this.data[this.editLimitId].note = inputs[inputs.length - 1].value;
                                        this.data[this.editLimitId].isEdit = false;
                                        this.isEdit = false;
                                        this.editLimitId = false;
                                    });
                                }
                                else{
                                    alert('Лимит с таким примечанием уже существует.\rПерепроверьте введённые данные и повторите попытку.')
                                }
                            }
                            else{
                                alert('Необходимо заполнить поле "Примечание"');
                                inputs[inputs.length - 1].value = null;
                            }
                        }
                    }
                });
            },10);
            
        },

        deletLimit(row){
            if(!this.isEdit){
                this.data.find((elem, i)=>{
                    if(elem.years[0].id == row[0].id){
                        if(confirm('Вы действительно хотите удалить этот лимит?\r\rПримечание лимита:\r'+elem.note)){
                            let dataQuery = {
                                data: []
                            };
                            this.data[i].years.forEach(year=>{
                                dataQuery.data.push({
                                    id: year.id
                                });
                            });
                            
                            axios({
                                method: 'delete',
                                data: dataQuery,
                                url: config.host+'/api/limitBudgetaryObligations/multiple',
                                headers: { Authorization: this.AuthStr }
                            }).catch(error=>{
                                if(error.response.data.error.messages[0] == 'true'){
                                    this.data.splice(i, 1);
                                }
                            });
                        }
                    }
                });
            }
            else{
                alert('Пожалуйста, закончите редактирование таблицы и повторите попытку.')
            }
        },

        limitOption(data){
            switch(data.data.id){
                case 'edit':
                    if(!this.isEdit){
                        this.data.find((limit, i)=>{
                            if(limit.years[0].id == data.id[0].id){
                                this.isEdit = true;
                                limit.isEdit = true;
                                this.editLimitId = i;
                                this.editLimit();
                            }
                        });
                    }
                    else{
                        alert('Пожалуйста, закончите редактирование таблицы и повторите попытку.')
                    }
                break;
                case 'delet':
                    data.data.event(data.id);
                    break;
            }
        },

        loadData(resp){
            let years = [];
            let limits = [];
            Object.keys(resp.data).forEach((note, i) => {
                let limit = {
                    created_at: resp.data[note].created_at,
                    note: note,
                    years: [],
                    isEdit: false,
                    options: [
                        {
                            id: 'edit',
                            text: 'Редактировать',
                            event: this.editLimit
                        },
                        {
                            id: 'delet',
                            text: 'Удалить',
                            event: this.deletLimit
                        }
                    ]
                }

                Object.keys(resp.data[note]).forEach((id, j) => {
                    if(id != 'created_at'){
                        let cellObject = resp.data[note][id];
                        let yearNumber = Object.keys(cellObject)[0];
                        let year = {
                            id: id,
                            year: yearNumber,
                            value: cellObject[yearNumber] != 'x' ? cellObject[yearNumber] : ''
                        };
                        limit.years.push(year);

                        if(i == 0){
                            years.push({
                                id: j,
                                value: yearNumber,
                                options: [
                                    {
                                        id: 'edit',
                                        text: 'Редактировать',
                                        event: this.editYear
                                    },
                                    {
                                        id: 'delet',
                                        text: 'Удалить',
                                        event: this.deletYear
                                    }
                                ]
                            });
                        }
                    }
                    
                });

                limits.push(limit);
            });

            limits.sort((a,b)=>{
                if(a.created_at > b.created_at){
                    return 1;
                }
                if(a.created_at < b.created_at){
                    return -1;
                }
                if(a.created_at == b.created_at){
                    return 0;
                }
            });

            this.data = limits;
            this.years = years;
            
        }
    },
    created () {
        this.isEdit = false;
        axios({
            method: 'get',
            url: config.host+'/api/contracts/'+this.$router.history.current.params.id+'/limitBudgetaryObligations',
            headers: { Authorization: this.AuthStr }
        }).then(resp=>{
            this.loadData(resp);
        });
    }
}
</script>

<style lang="scss">
.addColumn {
    width: 30px;
    height: 30px;
    margin: 30px 15px;
    border: 1px solid #5361ff;
    background-color: #ffffff;
    border-radius: 5px;
    background-image: url('../../../assets/add-row.svg');
    background-position: center;
    background-repeat: no-repeat;
}
.limit-header {
    grid-template-columns: 1fr 60px 500px;
}
.header-more-tools{
    margin: 0px !important;
}
.modal-wrapper {
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    display: none;
    z-index: 1000;

    &__active{
        display: flex;
    }
}
.modal-dark-background {
    background-color: rgba(7, 0, 48, 0.56);
    position: absolute;
    width: 100vw;
    height: 100vh;
    z-index: 100;
}
.modal-window {
    // width: 400px;
    // height: 300px;
    background-color: #ffffff;
    z-index: 101;
    position: absolute;
    border-radius: 10px;
    box-shadow: 0px 10px 40px #5361ff36;
    
    &_header {
        padding: 30px;
        display: grid;
        grid-template-columns: 1fr 30px;
        align-items: center;
        height: 90px;
        border-bottom: 1px solid #e9e9e9;
        font-size: 20px;
    }
    &_close {
        height: 100%;
        width: 100%;
        border: none;
        background-color: transparent;
        background-image: url('../../../assets/remove.svg');
        background-repeat: no-repeat;
        background-size: contain;
    }
}
.limit-year-form{
    display: grid;
    grid-template-rows: 2fr 1fr;
    // height: 210px !important;
    // width: 500px !important;
    padding: 20px;
    align-items: center;
    justify-content: center;

    & .table-view_cell{
        border: 1px solid #5361ff;
        text-align: center;
    }

    & .add-row{
        width: 100%;
        margin-top: 10px;
    }
}

.add-limit-year_button {
    padding: 20px;
    margin: 0px auto;
    max-width: 150px;
}

.modal-window-limits{
    height: 360px !important;
    width: 500px !important;
}

.table-view_headers, .table-view_row-content {
    display: grid;
    border-bottom: 1px solid #DCDCE8;
}
.table-view_header {
    padding: 30px 40px;
    font-size: 16px;
    font-weight: bold;
    color: #2E2E2E;
    cursor: pointer;
    position: relative;
    display: flex;
    align-items: center;
}

input.table-view_cell {
    margin: 10px 20px;
    padding: 5px 10px;
    border-radius: 5px;
    border: none;
    background-color: #F6F7FB;
    min-height: 50px;
    width: calc(100% - 40px);
}
.table-view_cell {
    padding: 20px 40px;
    font-size: 16px;
    color: #2E2E2E;
    /* max-height: 35px; */
    transition: all 0.3s;
    overflow: hidden;
}
.table-view_row {
    position: relative;
    border-right: 1px solid #DCDCE8;
}
.table-view_cell-textarea {
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
</style>