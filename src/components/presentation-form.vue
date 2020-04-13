<template>
    <div v-if="data != null" :class="'modal-wrapper '+[isActive?' modal-wrapper__active':'']">
        <div class="modal-dark-background"></div>
        <div class="modal-window">
            <header class="modal-window_header">{{data.title}} | Редактирование предъявлений <button @click="close" class="modal-window_close"></button></header>
            <div class="presentation-form">
                <button class="add-row" @click="addPresentation">Добавить новое предъявление</button>
                <table class="editble-table">
                    <thead>
                        <tr>
                            <td width="250px">Дата предъявления</td>
                            <td colspan="2">Содержание предъявления</td>
                        </tr>
                    </thead>
                        <tbody>
                            <tr v-if="data.notes.length == 0">
                                <td colspan="3" style="padding: 40px; text-align: center;">Для {{data.title}} нет созданных предъявлений</td>
                            </tr>
                            <tr v-for="(pres, i) in data.notes" :key="i">
                                <td align="left" valign="top"><input class="table-view_cell" type="date" v-model="pres.date"></td>
                                <td align="left" valign="top"><textarea style="max-width: 400px;" class="table-view_cell-textarea" v-model="pres.note" /></td>
                                <td style="padding: 20px 0px">
                                    <button  title="Удалить запись" @click="deletePresentation(i)" style="width: 20px; height: 20px;" class="modal-window_close"></button>
                                </td>
                            </tr>
                        </tbody>
                </table>
                <div class="save-button-wrapper">
                    <button class="add-row" @click="saveAndClose">Сохранить и закрыть</button>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import Vue from 'vue';
import Axios from 'axios';
import config from '../config';

import ScrollBar from 'vue-custom-scrollbar' 
Vue.component('scroll-bar', ScrollBar);

export default {
    data(){
        return {
            deleted: [],
            isActive: false,
            id: null,
            model: null,
            data: null,
            callback: null,
            AuthStr: (sessionStorage.getItem('token_type')+' ').concat(sessionStorage.getItem('access_token'))
        }
    },
    methods: {
        close(){
            this.isActive = false;
            this.id = null;
            this.model = null;
            this.data = null;
        },

        option(option){
            option.data.event(option.id);
        },

        loadData(){
            Axios({
                method: 'get',
                url: config.host+'/api/'+this.model+'/'+this.id+'/',
                headers: { Authorization: this.AuthStr }
            }).then(resp=>{
                this.data = {
                    title: ''
                }
                if(this.model == 'reports'){
                    Axios({
                        method: 'get',
                        url: config.host+'/api/constructionCertificates/'+resp.data.data.construction_certificate_id,
                        headers: { Authorization: this.AuthStr }
                    }).then(resp=>{
                        this.data.title = 'УП № '+resp.data.data.number
                    });
                }
                else{
                    if(this.model == 'mooringCertificates'){
                        this.data.title = 'УШ № '+resp.data.data.number
                    }
                    else{
                        this.data.title = 'УХ № '+resp.data.data.number
                    }
                }

                let tmpData = [];

                resp.data.data.presentations.forEach(elem => {

                    let note = '';
                    //TODO: Удалить блок try/catch когда в БД исчезнуть все записи в формате JSON
                    try {
                        const tmp = JSON.parse(elem.note);
                        tmp.forEach(n => {
                             note += n + '\r\n';
                        });
                    }
                    catch (e) {
                        note = elem.note.replace(/"/g, '').replace(/\\n/g, '\n');
                    }

                    tmpData.push({
                        id: elem.id,
                        date: elem.date.replace(/"/g,''),
                        note: note
                    });
                });

                this.data.notes = tmpData;
            });
        },

        addPresentation () {
            this.data.notes.push({
                id: -1,
                date: '2020-01-01',
                note: ''
            });
            this.$forceUpdate();
        },

        deletePresentation (i) {
            if (confirm('Вы действительно хотите удалить предъявление от ' + (new Date(this.data.notes[i].date)).toLocaleDateString() + '?\r\n'+
                        'Это действие невозможно отменить после выполнения.\r\n\r\n'+
                        'Содержание предъявления:\r\n' + this.data.notes[i].note)) {
                if (this.data.notes[i].id != -1){
                    Axios({
                            method: 'delete',
                            url: config.host + '/api/presentations/'+this.data.notes[i].id,
                            headers: { Authorization: this.AuthStr }
                    }).catch(err=>{
                        if(err.response.data.error.messages[0] == 'true') {
                            this.deleted.push(this.data.notes[i].id);
                            this.data.notes.splice(i,1); 
                            
                            this.$forceUpdate();
                        }
                        else {
                            alert('Не удалось удалить предъявление.');
                        }
                    });
                }
                else {
                    this.data.notes.splice(i,1); 
                    
                    this.$forceUpdate();
                }
            }
        },

        saveAndClose() {
            let model_type,
                queryResult = true;
            switch(this.model){
                case 'mooringCertificates':
                    model_type = 'mooring_certificates';
                break;
                case 'travelingCertificates':
                    model_type = 'traveling_certificates';
                break;
                case 'reports':
                    model_type = 'reports';
                break;
            }
            this.data.notes.forEach(note => {
                if( note.id != -1 ) {
                    Axios.put(config.host + '/api/presentations/'+note.id,
                                {
                                    model_id: this.id,
                                    model_type: model_type,
                                    date: JSON.stringify(note.date),
                                    note: JSON.stringify(note.note)
                                },
                                {headers: { Authorization: this.AuthStr }}).catch(() => queryResult = false);
                }
                else {
                    Axios.post(config.host + '/api/presentations/',
                                {
                                    model_id: this.id,
                                    model_type: model_type,
                                    date: JSON.stringify(note.date),
                                    note: JSON.stringify(note.note)
                                },
                                {headers: { Authorization: this.AuthStr }})
                    .then(resp => note.id = resp.data.data.id)
                    .catch(() => queryResult = false);
                }
            });
            if(queryResult) {
                let resultData = [];
                this.data.notes.forEach(elem=>{
                    resultData.push({
                        date: elem.date,
                        note: elem.note.replace(/\n/g, '<br />')
                    });
                });
                this.callback(resultData);

                this.close();
            }
            else {
                alert('Произошла ошибка\r\n\r\nПри сохранении не удалось записать часть данных.\r\nПожалуйста, проверьте введённые данные или повторите попытку позже.');
            }
        }
    }
}
</script>

<style lang="scss">
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
    width: 100vw;
    max-width: 50vw;
    max-height: 70vh;
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
        background-image: url('../assets/remove.svg');
        background-repeat: no-repeat;
        background-size: contain;
    }
}

.save-button-wrapper{
    position: absolute;
    bottom: 0px;
    left: 20px;
    text-align: center;
    width: calc(100% - 50px);
    padding: 20px;
    background-color: #ffffff;
}

.editble-table {
    width: 100%;
    max-height: 80%;
    margin: 15px 0px;
    border-collapse: collapse;

    & > thead td {
        padding: 30px 40px;
        border-bottom: 1px solid #DCDCE8;
        font-weight: bold;
    }

    & > tbody {
        & td {
            padding: 20px 40px;

            & * {
                width: 100%;
                margin: 0px !important;
            }
        }

        & tr:not(:last-child) {
            & td {
                border-bottom: 1px solid #DCDCE8;
            }
        }
    }
}

.presentation-form {
    padding: 30px 30px 75px 30px;
    // display: grid;
    // grid-template-columns: 1fr 2fr;
    max-height: 60vh;
    // grid-gap: 30px;

    overflow: hidden;
    overflow-y: auto;

    &_text-list,
    &_date-list {
        overflow-y: auto;
    }

    &_date {
        margin-bottom: 10px;
        display: grid;
        height: 70px;
        align-items: center;
        position: relative;
        padding-right: 80px;
        transition: all 0.3s;
        cursor: pointer;
        border-radius: 5px;
        
        &:hover {
            background-color: #5361ff;

            & *:not(input){
                color: #ffffff;
            }
        }
        
        &__selected {
            background-color: #5361ff;

            & *:not(input){
                color: #ffffff;
            }
        }
    }
    
    &_text {
        margin-bottom: 10px;
        display: grid;
        height: 70px;
        align-items: center;
        position: relative;
    }

    &_tools {
        margin: 0;
    }
}
</style>