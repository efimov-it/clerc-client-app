<template>
    <div class="main-page-wrapper">
        <breadcrumbs :data="breadCrumbs" />
        <div class="main-page-content">
            <div class="scroll-area">
                <div><button v-on:click="add" class="add-row add-new-deal">Добавить нового пользователя</button></div>
                <table-view style="width: auto; height: auto;" ref="table" :headers="tableHeaders" @sort="sort" @addRow="add" @update="update" :data="data" />
            </div>
        </div>
    </div>
</template>

<script>
import Vue from 'vue'
import axios from 'axios'
import config from '../config';
import ScrollBar from 'vue-custom-scrollbar';
Vue.component('scroll-bar', ScrollBar);

import BreadCrumbs from '../components/breadcrumbs.vue'
Vue.component('breadcrumbs', BreadCrumbs);

import TableView from '../components/table-view'
Vue.component('table-view', TableView);

//import Scrollbar from '../components/scrollbar-view'
//Vue.component('scrollbar-view', Scrollbar);

export default {
    data () {
        return {
            breadCrumbs: [
                {name: 'Пользователи', link: {path: '/users'}}, ''
            ],
            tableHeaders: [
                'Логин/E-mail',
                'Фамилия имя',
                'Пароль',
                'Роль',
                'Примечание'
            ],
            data: [],
            affterDeleting: null,
            lastAddedId: null,
            AuthStr: (sessionStorage.getItem('token_type')+' ').concat(sessionStorage.getItem('access_token'))
        }
    },
    methods : {
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
                this.lastAddedId = -1;
                let tmpData = this.data;
                tmpData.unshift({
                    id: -1,
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
                        email : {
                            value: '',
                            type: 'text'
                        },
                        fullname : {
                            value: '',
                            type: 'text'
                        },
                        password : {
                            value: '',
                            type: 'password'
                        },
                        role : {
                            value: '',
                            type : 'select',
                            keys :[
                                'Наблюдатель',
                                'Администратор'
                            ]
                        },
                        note : {
                            value: '',
                            type: 'text'
                        }
                    }
                });
                this.affterDeleting = tmpData;
            }
        },
        edit : function(data, id){

            if(data[2] != null){
                if(data[2].length < 6){
                    alert('Пароль должен быть не менее 6 символов.');
                    this.lastAddedId = id;
                    this.update();
                    return;
                }
                if(data[2].length == "••••••••••••••••"){
                    alert('Пожалуйста, укажите корректный пароль.');
                    this.lastAddedId = id;
                    this.update();
                    return;
                }
            }

            let paramsList = ['email',
                      'fullname',
                      'password',
                      'role',
                      'company'];
            let paramsString = '';
            data.forEach((elem, i) => {
                if(elem != null){
                    paramsString += '&'+paramsList[i]+'='+elem;
                    if(i == 2){
                        paramsString += '&password_confirmation='+elem;
                    }
                }
            });

            let query;
            
            if(this.lastAddedId != -1){
                query = axios.put(config.host+'/api/users/'+id,
                      paramsString.substring(1),
                      {headers: { Authorization: this.AuthStr } });
            }
            else{
                query = axios.post(config.host+'/api/users',
                        paramsString.substring(1)
                        ,{headers: { Authorization: this.AuthStr } });

                this.lastAddedId = null;
            }
            query.then((resp)=>{
                          this.data.find((elem) => {
                              if(elem.id == id){
                                elem.id = resp.data.data.id;
                                elem.data.email.value = resp.data.data.email;
                                elem.data.fullname.value = resp.data.data.fullname;
                                elem.data.password.value = '••••••••••••••••';
                                elem.data.role.value = resp.data.data.role != 0 ? 'Администратор' : 'Наблюдатель';
                                elem.data.note.value = resp.data.data.company;
                                
                                this.lastAddedId = null;
                              }
                          });
                          
                      }).catch((error) => {
                          alert('Ошибка!\r\rПроверьте введённые данные и повторите попытку.\r\rИнформация об ошибке:\r'+error);
                          this.lastAddedId = id;
                          this.update();
                      });
        },
        delet : function(id){
            if(confirm('Вы действительно хотите удалить этого пользователя?')){
                axios({
                        method: 'delete',
                        url: config.host+'/api/users/'+id,
                        headers: { Authorization: this.AuthStr }}).
                        then(() => {
                        }).catch(error => {
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


        load : function(link){
            //this.data = [];

            let context = this;
            
            link = link != undefined ? link : config.host+'/api/users';

            axios.get(link, {headers: { Authorization: this.AuthStr } }).
            then((resp) => {
                let respData = resp.data.data;

                for(let i = 0; i < respData.length; i++){
                    let tmp = {};
                    
                    tmp.id = respData[i].id;
                    tmp.data = {};

                    tmp.data.email = {};
                    tmp.data.email.value = respData[i].email;
                    tmp.data.email.type = 'text'

                    tmp.data.fullname = {};
                    tmp.data.fullname.value = respData[i].fullname;
                    tmp.data.fullname.type = 'text'

                    tmp.data.password = {};
                    tmp.data.password.value = '••••••••••••••••';
                    tmp.data.password.type = 'password'

                    tmp.data.role = {};
                    
                    tmp.data.role.value = respData[i].role == 1 ? 'Администратор' : 'Наблюдатель';
                    tmp.data.role.type = 'select';
                    tmp.data.role.keys =[
                        'Наблюдатель',
                        'Администратор'
                    ];

                    tmp.data.note = {};
                    tmp.data.note.value = respData[i].company;
                    tmp.data.note.type = 'text'
                    
                    tmp.options = [
                        {
                            event: this.edit,
                            id: 'edit',
                            text: 'Редактировать'
                        },
                        {
                            id: 'delet',
                            text: 'Удалить',
                            event: this.delet
                        }
                    ]
                    
                    context.data.push(tmp);
                }
                
                if(resp.data.links.next != null){
                    this.load(resp.data.links.next);
                }
                
            });
            
        }
    },
    created () {
        this.load();
    }
}
</script>

<style lang="scss">
.main-page-wrapper{
    padding: 25px 60px;
    width: 100vw;
}
.main-page-content{
    height: calc(100% - 120px);
    margin: 40px 0;
    //box-shadow: 0px 0px 16px #E7E7F0;
}
</style>