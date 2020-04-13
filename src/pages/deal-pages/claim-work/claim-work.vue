<template>
    <div class="table-button-wrap">
        <div><button class="add-row double-table-button" v-on:click="add()">Добавить новую претензионную работу</button></div>
        <table-view style="width: auto; height: auto;" 
                    ref="table"
                    :headers="headers"
                    @sort="sort"
                    @addRow="add"
                    @update="update"
                    :data="data"
                    groupBy="object"
                    sortBy="date" />
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
                'Объект',
                'Дата',
                'Номер требования',
                'Причина выставления требования',
                'Сумма требования, руб.',
                'Статус исполнения требования'
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
        add : function(){
            if(this.lastAddedId == null){
                axios.post(config.host+'/api/claimWorks/',
                'contract_id='+this.$router.history.current.params.id,
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
                            object : {
                                value: '',
                                type: 'text'
                            },
                            date : {
                                value: '',
                                type: 'date'
                            },
                            number : {
                                value: '',
                                type: 'text'
                            },
                            reason : {
                                value: '',
                                type: 'text'
                            },
                            amount : {
                                value: '',
                                type: 'number'
                            },
                            status : {
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
            let paramsList = ['object_name',
                      'date',
                      'number',
                      'cause',
                      'amount',
                      'status'];
            let paramsString = {};
            data.forEach((elem, i) => {
                if((elem != '' & elem != null & elem != undefined) | (i == 1)){
                    paramsString[paramsList[i]] = elem;
                }
            });
            axios.put(config.host+'/api/claimWorks/'+id,
                      paramsString,
                      {headers: { Authorization: this.AuthStr }})
                      .then((resp)=>{
                          this.data.find((elem) => {
                              if(elem.id == id){
                                let date = resp.data.data.date != null ? (new Date(resp.data.data.date)).toLocaleDateString() : '';

                                elem.data.object.value = resp.data.data.object_name;
                                elem.data.date.value = date;
                                elem.data.number.value = resp.data.data.number;
                                elem.data.reason.value = resp.data.data.cause;
                                elem.data.amount.value = resp.data.data.amount ? parseFloat(resp.data.data.amount).toLocaleString() : '';
                                elem.data.status.value = resp.data.data.status;
                                
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
                axios({
                    method: 'delete',
                    url: config.host+'/api/claimWorks/'+id,
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
                                }
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
                headers: { Authorization: this.AuthStr }})
            .then((resp) => {
                if(formatedData == undefined){
                    formatedData = [];
                }

                resp.data.data.claim_works.forEach(claimWork => {
                    let tmp = {};

                    tmp.id = claimWork.id;

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

                    let date = claimWork.date != null ? (new Date(claimWork.date)).toLocaleDateString() : '';

                    tmp.data = {};
                    
                    tmp.data.object = {};
                    tmp.data.object.value = claimWork.object_name;
                    tmp.data.object.type = 'text';
                    
                    tmp.data.date = {};
                    tmp.data.date.value = date;
                    tmp.data.date.type = 'date';
                    
                    tmp.data.number = {};
                    tmp.data.number.value = claimWork.number;
                    tmp.data.number.type = 'text';
                    
                    tmp.data.reason = {};
                    tmp.data.reason.value = claimWork.cause;
                    tmp.data.reason.type = 'text';
                    
                    tmp.data.amount = {};
                    tmp.data.amount.value = claimWork.amount ? parseFloat(claimWork.amount).toLocaleString() : '';
                    tmp.data.amount.type = 'number';
                    
                    tmp.data.status = {};
                    tmp.data.status.value = claimWork.status;
                    tmp.data.status.type = 'text';

                    formatedData.push(tmp);
                });
                
                if(resp.data.data.claim_works.length > 0){
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
        this.loadData(config.host+'/api/contracts/'+this.$router.history.current.params.id+'/claimWorks', 1);
    }
}
</script>