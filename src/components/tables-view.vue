<template>
    <div class="tables-view">
        <div>
            <div class="tables-view_header">
                <button v-for="(page, index) in pages" class="tables-view_tab" :class="[index == current ? 'tables-view_tab__active' : '']" v-on:click="buttonClick(index, page.path)">{{page.text}}</button>
                
                <button v-if="canImport & role == 1" class="tables-view_tab tables-view_tab__right tables-view_tab__active" @click="importExcel">Импорт из Excel</button>
                <button v-if="canImport & role == 1" class="tables-view_tab tables-view_tab__right tables-view_tab__active" @click="exportExcel">Экспорт в Excel</button>
            </div>
        </div>
            <router-view @presentation="presentation"></router-view>
        <input type="file" ref="inputDialog" class="input-dialog"/>
        <presentation-form ref="presentation" />
    </div>
</template>

<script>
import Vue from 'vue';
import config from '../config';
import ScrollBar from 'vue-custom-scrollbar';
Vue.component('scroll-bar', ScrollBar);
import PresentationForm from './presentation-form';
Vue.component('presentation-form', PresentationForm);
import router from '../router';
import Axios from 'axios';
export default {
    props: ['pages'],
    data () {
        return {
            current: 0,
            canImport: false,
            role: 0,
            AuthStr: (sessionStorage.getItem('token_type')+' ').concat(sessionStorage.getItem('access_token'))
        }
    },
    methods: {
        buttonClick : function(index, path){
            this.canImport = index > 1;
            this.current = index;
            router.push(path);
        },
        importExcel: function(){
            let formData = new FormData();
            let fileDialog = this.$refs.inputDialog;
            
            fileDialog.onchange = () => {
                if(fileDialog.files[0] != undefined){
                    formData.append('file', fileDialog.files[0]);
                    let type;
                    
                    switch(this.current){
                        case 2:
                            type = 'construction';
                        break;
                        case 3:
                            type = 'mooring';
                        break;
                        case 4:
                            type = 'traveling';
                        break;
                    }
                    formData.append('type', type);
                    
                    Axios.post(config.host+'/api/objects/'+this.$router.history.current.params.idObject+'/import', formData,
                                { headers: { Authorization: this.AuthStr } })
                                .then((resp) => {
                                    fileDialog.value = '';
                                }).catch((error) => {
                                    if(error.response.data.error.messages[0] == 'Ожидайте.'){
                                        alert('Файл был успешно загружен на сервер.\r\rВ данный момент он обрабатывается.\rЭто может занять несколько минут.');
                                    }
                                    else{
                                        alert('При загрузке файла произошла ошибка.')
                                    }
                                    fileDialog.value = '';
                                });
                }
            }

            fileDialog.click();
        },
        exportExcel: function(){
            let typeString;
            switch(this.current){
                case 2:
                    typeString = 'construction';
                break;
                case 3:
                    typeString = 'mooring';
                break;
                case 4:
                    typeString = 'traveling';
                break;
            }
            Axios({
                method: 'get',
                url: config.host+'/api/objects/'+this.$router.history.current.params.idObject+'/export?type='+typeString,
                headers: { Authorization: this.AuthStr } })
                        .then((resp) => {
                            window.open(config.host+'/storage/'+resp.data.data.name+'.'+resp.data.data.extension, '_blank')
                        }).catch((error) => {
                            console.log(error);
                        });
        },
        presentation(data, callback){
            this.$refs.presentation.isActive = true;
            this.$refs.presentation.id = data.id;
            this.$refs.presentation.model = data.model;
            this.$refs.presentation.callback = callback;
            this.$refs.presentation.loadData();
        }
    },
    created(){
        this.role = sessionStorage.getItem('role');
    }
}
</script>

<style lang="scss">
.tables-view{
    height: 100%;
    display: grid;
    grid-template-rows: auto 1fr;
    width: 100%;
    grid-gap: 20px;

    &_header{
        display: flex;
        flex-direction: row;
    }

    &_tab{
        padding: 10px 30px;
        border: none;
        border-radius: 5px;
        background-color: #ffffff;
        border: 1px solid #8C8C98;
        transition: all 0.3s;

        &:not(:last-child){
            margin-right: 30px;
        }

        &__right {
            margin-left: auto;
        }

        &:last-child{
            margin-left: 10px !important;
        }
        
        &__active{
            background-color: #5361FF;
            border-color: #5361FF;
            color: #ffffff;
        }
    }
}
</style>