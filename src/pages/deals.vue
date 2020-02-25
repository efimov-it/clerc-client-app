<template>
    <div class="scroll-area">
        <div><button v-on:click="add" class="add-row add-new-deal">Добавить новый контракт</button></div>
        <table-view style="width: auto; height: auto;" ref="table" @sort="sort" @rowClick="openDeal" :headers="tableHeaders" @addRow="add" @update="update" :data="data" :firstColumn="true" />
    </div>
</template>

<script>
import Vue from 'vue'
import router from '../router'
import axios from 'axios'
import config from '../config';
import ScrollBar from 'vue-custom-scrollbar';
Vue.component('scroll-bar', ScrollBar);

import TableView from '../components/table-view'
Vue.component('table-view', TableView);

import DealView from './deal-view'
Vue.component('deal-view', DealView);

export default {
    data () {
        return {
            tableHeaders: [
                'Наименование',
                'Номер Гос. контракта',
                'Дата подписание контракта',
                'Контрагент',
                'Цена котракта (₽)',
                'Окончание выполнения работ',
                'Примечание'
            ],
            data: [],
            lastAddedId: null,
            affterDeleting: null,
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
        openDeal : function(id){
            let number;
            this.data.find(function(elem){
                if(elem.id == id){
                    number = elem.data.number.value;
                    return;
                }
            });
            
            this.$emit('update',
            {
                event : 'openDeal',
                name : number,
                link: {path: '/deal/'+id, params: {dealId: id}}
            });
            this.$router.push({path: '/deal/'+id+'', params: {dealId: id}});
        },
        refreshToken: function(){
                axios.post(config.host+'/oauth/token',
                "refresh_token="+sessionStorage.getItem(refresh_token)+
                "&client_id=1"+
                "&client_secret=c75IGwuqkjrO1RWCE4Ntn4zqpQdpgnEO2wGT9iMT"+
                "&grant_type=password").then((resp) => {
                    sessionStorage.setItem('access_token', resp.data.access_token);
                    sessionStorage.setItem('expires_in', resp.data.expires_in);
                    sessionStorage.setItem('refresh_token', resp.data.refresh_token);
                    sessionStorage.setItem('token_type', resp.data.token_type);
                }).catch((error)=>{
                    console.log(error);
                });
        },

        add : function(){
            if(this.lastAddedId == null){
                axios.post(config.host+'/api/contracts', '', {headers: { Authorization: this.AuthStr } }).
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
                                event: this.delet,
                                id: 'delet',
                                text: 'Удалить'
                            }],
                        data: {
                            name : {
                                value: '',
                                type: 'text'
                            },
                            number : {
                                value: '',
                                type: 'text'
                            },
                            dateStart : {
                                value: '',
                                type: 'date'
                            },
                            contragent : {
                                value: '',
                                type: 'text'
                            },
                            price : {
                                value: '',
                                type: 'number'
                            },
                            dateEnd : {
                                value: '',
                                type: 'date'
                            },
                            note : {
                                value: '',
                                type: 'text'
                            }
                        }
                    });
                    this.affterDeleting = tmpData;
                });
            }
        },
        edit : function(data, id){
            let paramsList = [
                'name',
                'number',
                'date',
                'counterpart',
                'price',
                'deadline',
                'note',
            ];
            let params = {};

            for(let i = 0; i < data.length; i++){
                if((data[i] != null & data[i] != undefined & data[i] != '') | (i == 2 | i == 5)){
                    params[paramsList[i]] = data[i];
                }
            }

            axios.put(config.host+'/api/contracts/'+id,
                      params,
                      {headers: { Authorization: this.AuthStr } })
                      .then((resp)=>{
                          this.data.find((elem) => {
                              if(elem.id == id){
                                elem.data.number.value = resp.data.data.number;
                                elem.data.name.value = resp.data.data.name;
                                elem.data.contragent.value = resp.data.data.counterpart;
                                elem.data.price.value = resp.data.data.price != null ? parseFloat(resp.data.data.price).toLocaleString() : '';
                                
                                let date = resp.data.data.date != null ? (new Date(resp.data.data.date)).toLocaleDateString() : '';
                                let deadLine = resp.data.data.deadline != null ? (new Date(resp.data.data.deadline)).toLocaleDateString() : '';

                                elem.data.dateStart.value = date;
                                elem.data.dateEnd.value = deadLine;
                                elem.data.note.value = resp.data.data.note;
                
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
            if(confirm('Вы действительно хотите удалить контракт?')){
                axios.delete(config.host+'/api/contracts/'+id,
                            {headers: { Authorization: this.AuthStr } })
                        .then((resp)=>{
                        }).catch((error) => {
                            if(error.response.data.error.messages[0] == 'true'){
                                let newData = this.data.slice(0);
                                for(let i = 0; i < newData.length; i++){
                                    if(newData[i].id == id){
                                        newData.splice(i, 1);
                                        this.affterDeleting = newData;
                                        this.data = newData;
                                        this.lastAddedId = null;
                                    }
                                };
                                return;
                            }
                            alert('Ошибка!\r\rНе удалось удалить элемент.\r\rИнформация об ошибке:\r'+error);
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

        import: function(id){

        },

        loadDeal : function(link, formatedData){

            if(formatedData == undefined){
                formatedData = [];
            }

            let context = this;
            
            link = link == undefined ? config.host+'/api/contracts' : link;

            axios.get(link,
                      {headers: { Authorization: this.AuthStr} }).
            then((resp) => {
                let respData = resp.data.data;

                for(let i = 0; i < respData.length; i++){
                    let tmp = {};
                    
                    tmp.id = respData[i].id;
                    tmp.status = true;

                    tmp.options = [
                        {
                            event: this.edit,
                            id: 'edit',
                            text: 'Редактировать'
                        }
                    ]

                    if(!tmp.status){
                        tmp.options.push(
                            {
                                event: this.import,
                                id: 'import',
                                text: 'Импортировать'
                            }
                        )
                    }
                    
                    tmp.options.push(
                        {
                            event: this.delet,
                            id: 'delet',
                            text: 'Удалить'
                        }
                    )

                    tmp.data = {};

                    tmp.data.name = {}
                    tmp.data.name.value = respData[i].name;
                    tmp.data.name.type = 'text';

                    tmp.data.number = {}
                    tmp.data.number.value = respData[i].number;
                    tmp.data.number.type = 'text';

                    
                    let date = respData[i].date != null ? (new Date(respData[i].date)).toLocaleDateString() : '';

                    tmp.data.dateStart = {}
                    tmp.data.dateStart.value = date;
                    tmp.data.dateStart.type = 'date';


                    tmp.data.contragent = {}
                    tmp.data.contragent.value = respData[i].counterpart;
                    tmp.data.contragent.type = 'text';

                    tmp.data.price = {}
                    tmp.data.price.value = respData[i].price != null ? parseFloat(respData[i].price).toLocaleString() : '';
                    tmp.data.price.type = 'number';

                    let deadline = respData[i].deadline != null ? (new Date(respData[i].deadline)).toLocaleDateString() : '';

                    tmp.data.dateEnd = {}
                    tmp.data.dateEnd.value = deadline;
                    tmp.data.dateEnd.type = 'date';

                    tmp.data.note = {}
                    tmp.data.note.value = respData[i].note;
                    tmp.data.note.type = 'text';


                    formatedData.push(tmp);
                }
                
                if(resp.data.links.next != null){
                    this.loadDeal(resp.data.links.next, formatedData);
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
        this.loadDeal();
    }
}
</script>

<style lang="scss">
.add-new-deal{
    margin: 20px;
}
</style>