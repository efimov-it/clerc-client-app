<template>
    <div class="table-button-wrap">
        <div><button class="add-row" v-on:click="add">Добавить новую характеристику</button></div>
        <div class="table-wrapper">
            <table-view ref="table" :headers="headers" @sort="sort" @addRow="add" @update="update" :data="data" />
        </div>
    </div>
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
            headers : [
                'Наименование',
                'Значение'
            ],
            data: [],
            affterDeleting: null,
            lastAddedId: null,
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
        add : function(data){
            if(this.lastAddedId == null){
                axios.post(config.host+'/api/aboutObjects/',
                'contract_object_id='+this.$router.history.current.params.idObject,
                {headers: { Authorization: this.AuthStr }}).
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
                                id: 'delet',
                                text: 'Удалить',
                                event: this.delet
                            }],
                        data: {
                            name : {
                                value: '',
                                type: 'text'
                            },
                            value : {
                                value: '',
                                type: 'text'
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
            let params = '';
            let paramsNames = [
                'name',
                'value'
            ]
            data.forEach((elem, i) => {
                if(elem != '' & elem != null & elem != undefined){
                    params += '&'+paramsNames[i]+'='+elem;
                }
            });
            axios.put(config.host+'/api/aboutObjects/'+id,
                      params.substring(1),
                      {headers: { Authorization: this.AuthStr }})
                      .then((resp)=>{
                          this.data.find((elem) => {
                              if(elem.id == id){
                                elem.data.name.value = resp.data.data.name;
                                elem.data.value.value = resp.data.data.value;
                              }
                          });
                        this.lastAddedId = null;
                          
                      }).catch((error) => {
                          alert('Ошибка!\r\rПроверьте введённые данные и повторите попытку.\r\rИнформация об ошибке:\r'+error);
                          this.lastAddedId = id;
                          this.update();
                      });
        },

        delet: function(id){
            if(confirm('Вы действительно хотите удалить эту запись?')){
                axios({
                    method: 'delete',
                    url: config.host+'/api/aboutObjects/'+id,
                    headers: { Authorization: this.AuthStr }})
                        .catch((error) => {
                            if(error.response.data.error.messages[0] == 'true'){
                                let newData = this.data.slice(0);
                                for(let i = 0; i < newData.length; i++){
                                    if(newData[i].id == id){
                                        newData.splice(i, 1);
                                        this.affterDeleting = newData;
                                        this.data = newData;
                                    }
                                };
                            }
                            else{
                                alert('Ошибка!\r\rНе удалось удалить элемент.\r\rИнформация об ошибке:\r'+error);
                            }
                        });
            }
        },
        loadData(link, i, formatedData){
            axios({
                method: 'get',
                url: link+'?page='+i,
                headers: { Authorization: this.AuthStr }
            }).
            then((resp) => {
                if(formatedData == undefined){
                    formatedData = [];
                }
                
                resp.data.data.about_objects.forEach(about=>{

                    let tmp = {};

                    tmp.id = about.id;

                    tmp.options = [
                        {
                            id: 'edit',
                            text: 'Редактировать',
                            event: this.edit
                        },
                        {
                            id: 'delet',
                            text: 'Удалить',
                            event: this.delet
                        }
                    ];

                    tmp.data = {};
                    
                    tmp.data.name = {};
                    tmp.data.name.value = about.name;
                    tmp.data.name.type = 'text';
                    
                    tmp.data.value = {};
                    tmp.data.value.value = about.value;
                    tmp.data.value.type = 'text';

                    formatedData.push(tmp);

                });

                if(resp.data.data.about_objects.length > 0){
                    i = i + 1;
                    this.loadData(link, i, formatedData);
                }
                else{
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
        this.loadData(config.host+'/api/objects/'+this.$router.history.current.params.idObject+'/aboutObjects', 1)
    }
}
</script>