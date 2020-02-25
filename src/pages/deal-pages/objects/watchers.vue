<template>
    <table-view ref="table" :headers="headers" @checkboxChange="userSelect" @addRow="add" @update="update" :data="data" />    
</template>

<script>
import Vue from 'vue';
import axios from 'axios';
import config from '../../../config';

import TableView from '../../../components/table-view';
Vue.component('table-view', TableView);

export default {
    data () {
        return {
            headers: [
                '',
                'Фамилия Имя',
                'Примечание'
            ],
            data: [],
            lastAddedId: null,
            AuthStr: (sessionStorage.getItem('token_type')+' ').concat(sessionStorage.getItem('access_token'))
        }
    },
    methods: {
        userSelect: function(index){
            let tmpUsers = '';
            let i = 0;
            this.data.forEach(elem => {
                if(elem.data.isWatcher.value == true){
                    tmpUsers += '&users_ids['+i+']='+elem.id;
                }
                i++;
            });

            axios.put(config.host+'/api/objects/'+this.$router.history.current.params.idObject,
                      tmpUsers.substring(1),
                      {headers: { Authorization: this.AuthStr } }).
                      then(resp => {
                        console.log(resp);
                      });
            
        },
        add : function(data){
            axios.post(config.host+'/api/travelingCertificates',
            'contract_object_id='+this.$router.history.current.params.idObject,
            {headers: { Authorization: this.AuthStr } }).
            then((resp)=>{
                this.lastAddedId = resp.data.data.id;
                this.data.push({
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
                        date : {
                            value: '',
                            type: 'date'
                        },
                        note : {
                            value: '',
                            type: 'text'
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
                            type: 'file'
                        }
                    }
                });
            });
        },

        update: function(){
            if(this.lastAddedId != null){
                this.$refs.table.$refs[this.lastAddedId][0].isEdit = true;
                this.$refs.table.$refs[this.lastAddedId][0].event = this.edit;
                this.lastAddedId = null;
            }
        },

        edit: function(data, id){
            axios.put(config.host+'/api/travelingCertificates/'+id,
                      'number='+data[0]+
                      '&name='+data[1]+
                      '&documentation='+data[2]+
                      '&date='+data[3]+
                      '&note='+data[4]+
                      '&closing_date_planned='+data[5]+
                      '&closing_date_real='+data[6]+
                      '&files=0',
                      {headers: { Authorization: this.AuthStr } })
                      .then((resp)=>{
                          this.data.find((elem) => {
                              if(elem.id == id){
                                let date = '';
                                let plannedDate = resp.data.data.closing_date_planned != null ? (new Date(resp.data.data.closing_date_planned)).toLocaleDateString() : '';
                                let realDate = resp.data.data.closing_date_real != null ? (new Date(resp.data.data.closing_date_real)).toLocaleDateString() : '';

                                elem.data.namber.value = resp.data.data.number;
                                elem.data.name.value = resp.data.data.name;
                                elem.data.documentation.value = '';
                                elem.data.date.value = date;
                                elem.data.note.value = '';
                                elem.data.plannedDate.value = plannedDate;
                                elem.data.realDate.value = realDate;
                                elem.data.files.value = '';
                              }
                          });
                      }).catch((error) => {
                          alert('Ошибка!\r\rПроверьте введённые данные и повторите попытку.\r\rИнформация об ошибке:\r'+error);
                          this.lastAddedId = id;
                          this.update();
                      });
        },

        delet: function(id){
            axios.delete(config.host+'/api/travelingCertificates/'+id,
                          {headers: { Authorization: this.AuthStr } })
                      .then((resp)=>{
                          for(let i = 0; i < this.data.length; i++){
                              if(this.data[i].id == id){
                                  this.data.splice(i,1);
                                  return;
                              }
                          }
                      }).catch((error) => {
                          if(error.response.data.error.messages[0] == 'true'){
                            for(let i = 0; i < this.data.length; i++){
                                if(this.data[i].id == id){
                                    this.data.splice(i,1);
                                    return;
                                }
                            }
                          }
                          alert('Ошибка!\r\rНе удалось удалить элемент.\r\rИнформация об ошибке:\r'+error);
                      });
        },

        loadData(link){
            link = link == undefined ? config.host+'/api/contracts' : link;
            axios.get(link, {headers: { Authorization: this.AuthStr } }).
            then(resp => {
                let users = resp.data.data;

                
                axios.get(config.host+'/api/objects/'+this.$router.history.current.params.idObject+'',
                        {headers: { Authorization: this.AuthStr } })
                .then((resp) => {
                    users.forEach(user => {
                        if(user.role == 0){
                            let tmp = {};

                            tmp.id = user.id;

                            tmp.data = {};

                            
                            tmp.data.isWatcher = {};
                            tmp.data.isWatcher.value = false;
                            tmp.data.isWatcher.type = 'checkbox'

                            for(let i = 0; i < resp.data.data.users.length; i++){
                                if(resp.data.data.users[i].id == user.id){
                                    tmp.data.isWatcher.value = true;
                                }
                            }
                            
                            tmp.data.name = {};
                            tmp.data.name.value = user.fullname;
                            tmp.data.name.type = 'text'
                            
                            tmp.data.note = {};
                            tmp.data.note.value = user.company;
                            tmp.data.note.type = 'text'

                            this.data.push(tmp);
                        }
                    });
                });
                
                if(resp.data.links.next != null){
                    this.loadData(resp.data.links.next);
                }
            });
        }
    },
    created () {
        this.loadData(config.host+'/api/users');
    }
}
</script>