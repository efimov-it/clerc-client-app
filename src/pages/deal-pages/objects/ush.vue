<template>
    <table-view  style="width: auto; height: auto;" 
                ref="table"
                :headers="headers"
                @sort="sort"
                @addRow="add"
                @update="update"
                columns="grid-template-columns: repeat(3, minmax(300px, 1fr)) 500px repeat(3, minmax(300px, 1fr)) 40px;"

                @addInnerDate="addInnerDate"
                @loadData="loadNewData"

                :data="data"
                :inRowAdd="true" />    
</template>

<script>
import Vue from 'vue';
import config from '../../../config';
import axios from 'axios';

import TableView from '../../../components/table-view';
Vue.component('table-view', TableView);

export default {
    data () {
        return {
            headers: [
                '№ УШ',
                'Наименование УШ',
                'Действующая документация',
                'Дата предъявления',
                'Плановая дата закрытия УШ',
                'Дата закрытия',
                'Фотографии и необходимые файлы'
            ],
            data: [],
            affterDeleting: null,
            lastAddedId: null,
            role: 0,
            maxData: 5,
            AuthStr: (sessionStorage.getItem('token_type')+' ').concat(sessionStorage.getItem('access_token'))
        }
    },
    methods: {
        sort(sortArray){
            this.data = [];
            setTimeout(() => {
            sortArray.forEach(elem => {
                this.data.push(elem);
            });
            }, 5);
        },
        add : function(){
            if(this.lastAddedId == null){
                axios.post(config.host+'/api/mooringCertificates/',
                'contract_object_id='+this.$router.history.current.params.idObject,
                {headers: { Authorization: this.AuthStr } }).
                then((resp)=>{
                    this.lastAddedId = resp.data.data.id;
                    let tmpData = this.data;
                    tmpData.unshift({
                        id: resp.data.data.id,
                        options: [
                            {
                                id: 'edit',
                                text: 'Редактировать',
                                event: this.edit
                            },
                            {
                                id: 'editPresentation',
                                text: 'Редактировать предъявления',
                                event: this.editPresentation
                            },
                            {
                                id: 'delet',
                                text: 'Удалить',
                                event: this.delet
                            }],
                        data: { 
                            namber : {
                                value: '',
                                type: 'text'
                            },
                            name : {
                                value: '',
                                type: 'text'
                            },
                            documentation : {
                                value: '',
                                type: 'text'
                            },
                            presentation : {
                                value: [],
                                type: 'presentation'
                            },
                            plannedDate : {
                                value: '',
                                type: 'date'
                            },
                            realDate : {
                                value: '',
                                type: 'date'
                            },
                            files : {
                                value: '',
                                type: 'files',
                                model: 'mooringCertificates'
                            }
                        }
                    });
                    this.affterDeleting = tmpData;
                });
            }
        },

        update: function(){
            if(this.affterDeleting != null){
                this.data = [];
                setTimeout(()=>{
                    this.data = this.affterDeleting;
                    this.affterDeleting = null;
                }, 100);
            }

            if(this.lastAddedId != null){
                this.$refs.table.$refs[this.lastAddedId][0].isEdit = true;
                this.$refs.table.$refs[this.lastAddedId][0].event = this.edit;
            }
        },

        edit: function(data, id){
            let paramList = [
                'number',
                'name',
                'current_documentation',
                'closing_date_planned',
                'closing_date_real'
            ];
            
            let params = {};

            for(let i = 0; i < data.length; i++){
                if((data[i] != '' & data[i] != null & data != undefined) | (i == 3 | i == 4)){
                    params[paramList[i]]=data[i];
                }
            }
            axios.put(config.host+'/api/mooringCertificates/'+id,
                      params,
                      {headers: { Authorization: this.AuthStr } })
                      .then((resp)=>{
                          this.data.find((elem) => {
                              if(elem.id == id){
                                let plannedDate = resp.data.data.closing_date_planned != null ? (new Date(resp.data.data.closing_date_planned)).toLocaleDateString() : '';
                                let realDate = resp.data.data.closing_date_real != null ? (new Date(resp.data.data.closing_date_real)).toLocaleDateString() : '';

                                elem.data.namber.value = resp.data.data.number;
                                elem.data.name.value = resp.data.data.name;
                                elem.data.documentation.value = resp.data.data.current_documentation;
                                elem.data.presentation.value = resp.data.data.presentations;
                                elem.data.plannedDate.value = plannedDate;
                                elem.data.realDate.value = realDate;
                                elem.data.files.value = resp.data.data.files;
                                
                                this.lastAddedId = null;
                              }
                          });
                      }).catch((error) => {

                          alert('Ошибка!\r\rПроверьте введённые данные и повторите попытку.\r\rИнформация об ошибке:\r'+error);
                          this.lastAddedId = id;
                          this.update();
                      });
        },

        delet: function(id){
            if(confirm('Вы действительно хотите удалить эту запись?')){
                axios.delete(config.host+'/api/mooringCertificates/'+id,
                            {headers: { Authorization: this.AuthStr } })
                        .then(()=>{
                            for(let i = 0; i < this.data.length; i++){
                                if(this.data[i].id == id){
                                    this.data.splice(i,1);
                                    return;
                                }
                            }
                        }).catch((error) => {
                            if(error.response.data.error.messages[0] == 'true'){
                                let newData = this.data.slice(0);
                                for(let i = 0; i < newData.length; i++){
                                    if(newData[i].id == id){
                                        newData.splice(i, 1);
                                        this.affterDeleting = newData;
                                        this.data = newData;
                                    }
                                }
                            }
                            else{
                                alert('Ошибка!\r\rНе удалось удалить элемент.\r\rИнформация об ошибке:\r'+error);
                            }
                        });
            }
        },


        addInnerDate(id, value){
            if(value != ""){
                this.data.forEach(elem => {
                    if(elem.id == id){
                        axios({
                            method: 'post',
                            url: config.host+'/api/presentations',
                            data: {
                                model_id: id,
                                model_type: 'mooring_certificates',
                                date: value
                            },
                            headers: { Authorization: this.AuthStr }
                        }).then(resp => {
                            console.log(resp);
                            
                        });
                    }
                });
            }
            else{
                alert('Ошибка!\r\rПожалуйста укажите дату.');
            }
        },

        editPresentation(id){
            this.$emit('presentation', {id: id, model: 'mooringCertificates'}, (data)=>{
                this.data.forEach(elem=>{
                    if(elem.id == id){
                        elem.data.presentation.value = data;
                    }
                });

                let tmp = this.data;
                this.data = [];
                this.data = tmp;
            });
        },

        loadNewData(i){
            this.loadData( config.host+'/api/objects/'+this.$router.history.current.params.idObject+'/mooringCertificates', i, this.data);
        },

        loadData(link, i, formatedData){
            if(formatedData == undefined){
                formatedData = [];
            }
            axios.get(link+'?page='+i,
                    {headers: { Authorization: this.AuthStr } })
            .then((resp) => {
                resp.data.data.mooring_certificates.forEach(mooringCertificate => {
                    let tmp = {};

                    tmp.id = mooringCertificate.id;

                    tmp.options = [
                        {
                            id: 'edit',
                            text: 'Редактировать',
                            event: this.edit
                        },
                        {
                            id: 'editPresentation',
                            text: 'Редактировать предъявления',
                            event: this.editPresentation
                        }
                    ];

                    if(this.role == 1){
                        tmp.options.push(
                            {
                                id: 'delet',
                                text: 'Удалить',
                                event: this.delet
                            }
                        );
                    }

                    let plannedDate = mooringCertificate.closing_date_planned != null ? (new Date(mooringCertificate.closing_date_planned)).toLocaleDateString() : '';
                    let realDate = mooringCertificate.closing_date_real != null ? (new Date(mooringCertificate.closing_date_real)).toLocaleDateString() : '';

                    tmp.data = {};
                    
                    tmp.data.namber = {};
                    tmp.data.namber.value = mooringCertificate.number;
                    tmp.data.namber.type = 'text';
                    
                    tmp.data.name = {};
                    tmp.data.name.value = mooringCertificate.name;
                    tmp.data.name.type = 'text';
                    
                    tmp.data.documentation = {};
                    tmp.data.documentation.value = mooringCertificate.current_documentation;
                    tmp.data.documentation.type = 'text';
                    
                    tmp.data.presentation = {};
                    tmp.data.presentation.type = 'presentation';
                    tmp.data.presentation.value = mooringCertificate.presentations;
                    
                    tmp.data.plannedDate = {};
                    tmp.data.plannedDate.value = plannedDate;
                    tmp.data.plannedDate.type = 'date';
                    
                    tmp.data.realDate = {};
                    tmp.data.realDate.value = realDate;
                    tmp.data.realDate.type = 'date';
                    
                    tmp.data.files = {};
                    tmp.data.files.value = mooringCertificate.files;
                    tmp.data.files.type = 'files';
                    tmp.data.files.model = 'mooringCertificates';

                    formatedData.push(tmp);
                });

                if(resp.data.data.mooring_certificates.length>0 & i != this.maxData){
                    i = i + 1;  
                    this.loadData(link, i, formatedData);
                }
                else{
                    this.maxData += 5;
                    this.$refs.table.manyQueries = i + 1;
                    formatedData.sort((a,b)=>{
                        if(a.id > b.id){
                            return 1;
                        }
                        if(a.id < b.id){
                            return -1;
                        }
                        if(a.id == b.id){
                            return 0;
                        }
                    });
                    this.data = formatedData;
                }
            });
        }
    },
    created () {
        this.role = sessionStorage.getItem('role');
        this.loadData(config.host+'/api/objects/'+this.$router.history.current.params.idObject+'/mooringCertificates', 1)
    }
}
</script>