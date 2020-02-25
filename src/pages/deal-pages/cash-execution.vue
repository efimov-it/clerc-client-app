<template>
    <div class="table-button-wrap">
        
        <div><button class="add-row" :style="this.data.length > 0 ? 'visibility: hidden' : ''" v-on:click="add()">Добавить новое кассовое исполнение</button></div>
        <div class="table-wrapper">
            <table-view noSort="true" :alwaysUpdate="true" ref="table" :headers="headers" @addRow="add" @update="update" :data="data" />    
        </div>
    </div>
</template>

<script>
import Vue from 'vue';
import config from '../../config';
import axios from 'axios';

import TableView from '../../components/table-view';
Vue.component('table-view', TableView);

export default {
    data () {
        return {
            headers : [
                'Наименование объекта по ГК',
                'Наименование этапа/аванс',
                'Стоимость этапа/аванс',
                'Оплаченная сумма по КС',
                'Остаток незакрытого аванса по контракту нарастающим итогом',
                'Дата оплаты',
                'Примечание'
            ],
            data: [],
            affterDeleting: null,
            lastAddedId: null,
            AuthStr: (sessionStorage.getItem('token_type')+' ').concat(sessionStorage.getItem('access_token'))
        }
    },
    methods: {
        add : function(data){
            if(this.lastAddedId == null){
                axios.post(config.host+'/api/cashExecutions',
                'contract_id='+this.$router.history.current.params.id,
                {headers: { Authorization: this.AuthStr }}).
                then((resp)=>{
                    this.lastAddedId = resp.data.data.id;
                    let tmp;
                    if(this.data.length > 0){
                        tmp = {
                            id: resp.data.data.id,
                            isGrey: false,
                            options: [
                                {
                                    id: 'add',
                                    text: 'Редактировать',
                                    event: this.add
                                },
                                {
                                    id: 'delet',
                                    text: 'Удалить',
                                    event: this.delet
                                }],
                            data: {
                                objectName : {
                                    value: this.data[0].data.objectName.value,
                                    type: 'text'
                                },
                                stageName : {
                                    value: this.data[0].data.stageName.value,
                                    type: 'text'
                                },
                                price : {
                                    value: this.data[0].data.price.value,
                                    type: 'number'
                                },
                                amount_paid : {
                                    value: this.data[0].data.amount_paid.value,
                                    type: 'number'
                                },
                                advance_balance : {
                                    value: this.data[0].data.advance_balance.value,
                                    type: 'number'
                                },
                                date : {
                                    value: this.data[0].data.date.value,
                                    type: 'date'
                                },
                                note : {
                                    value: this.data[0].data.note.value,
                                    type: 'text'
                                }
                            }
                        };
                    }
                    else{
                        tmp = {
                            id: resp.data.data.id,
                            isGrey: false,
                            options: [
                                {
                                    id: 'add',
                                    text: 'Редактировать',
                                    event: this.add
                                },
                                {
                                    id: 'delet',
                                    text: 'Удалить',
                                    event: this.delet
                                }],
                            data: {
                                objectName : {
                                    value: '',
                                    type: 'text'
                                },
                                stageName : {
                                    value: '',
                                    type: 'text'
                                },
                                price : {
                                    value: '',
                                    type: 'number'
                                },
                                amount_paid : {
                                    value: '',
                                    type: 'number'
                                },
                                advance_balance : {
                                    value: '',
                                    type: 'number'
                                },
                                date : {
                                    value: '',
                                    type: 'date'
                                },
                                note : {
                                    value: '',
                                    type: 'text'
                                }
                            }
                        };
                    }
                    this.data.splice(0, 0, tmp);
                    this.data[1].options.splice(0,1);
                    this.data[1].isGrey = true;
                    
                    this.data[0].options = [
                                {
                                    id: 'add',
                                    text: 'Редактировать',
                                    event: this.add
                                },
                                {
                                    id: 'delet',
                                    text: 'Удалить',
                                    event: this.delet
                    }];

                    tmp = this.data;

                    this.data = [];

                    setTimeout(() => {
                        this.data = tmp;
                    }, 10);
                });
            }
        },

        update: function(){
            console.log(this.affterDeleting);
            
            if(this.affterDeleting != null){
                this.data = [];
                setTimeout(()=>{
                    this.affterDeleting[0].isGrey = false;
                    if(this.affterDeleting[0].options[0].id != 'add'){
                        this.affterDeleting[0].options.splice(0,0,{
                            id: 'add',
                            text: 'Редактирование',
                            event: this.add
                        })
                    }
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
                      'stage_name',
                      'price',
                      'amount_paid',
                      'advance_balance',
                      'payment_date',
                      'note'];
            let paramsString = {};

            data.forEach((elem, i) => {
                if((elem != null & elem != '' & elem != undefined) | (i == 5)){
                    paramsString[paramsList[i]] = elem;
                }
            });

            axios.put(config.host+'/api/cashExecutions/'+id,
                      paramsString,
                      {headers: { Authorization: this.AuthStr }})
                      .then((resp)=>{
                        this.data[0].data.objectName.value = resp.data.data.object_name;
                        this.data[0].data.stageName.value = resp.data.data.stage_name;
                        this.data[0].data.price.value = resp.data.data.price ? parseFloat(resp.data.data.price).toLocaleString() : '';
                        this.data[0].data.amount_paid.value = resp.data.data.amount_paid ? parseFloat(resp.data.data.amount_paid).toLocaleString() : '';
                        this.data[0].data.advance_balance.value = resp.data.data.advance_balance ? parseFloat(resp.data.data.advance_balance).toLocaleString() : '';

                        let date = resp.data.data.payment_date != null ? (new Date(resp.data.data.payment_date)).toLocaleDateString() : '';
                            
                        this.data[0].data.date.value = date;

                        this.data[0].data.note.value = resp.data.data.note;
                                
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
                    url:config.host+'/api/cashExecutions/'+id,
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
        loadData(link, i){
            axios({
                method: 'get',
                url: link+'?page='+i,
                headers: { Authorization: this.AuthStr }})
            .then((resp) => {
                resp.data.data.cash_executions.forEach((cashExecution, i) => {
                    let tmp = {};

                    tmp.id = cashExecution.id;
                    tmp.options = [];
                    tmp.isGrey = true;

                    tmp.options.push(
                        {
                            id: 'delet',
                            text: 'Удалить',
                            event: this.delet
                        }
                    );

                    let date = cashExecution.payment_date != null ? (new Date(cashExecution.payment_date)).toLocaleDateString() : '';

                    tmp.data = {};
                    
                    tmp.data.objectName = {};
                    tmp.data.objectName.value = cashExecution.object_name;
                    tmp.data.objectName.type = 'text';
                    
                    tmp.data.stageName = {};
                    tmp.data.stageName.value = cashExecution.stage_name;
                    tmp.data.stageName.type = 'text';
                    
                    tmp.data.price = {};
                    tmp.data.price.value = cashExecution.price ? parseFloat(cashExecution.price).toLocaleString() : '';
                    tmp.data.price.type = 'number';
                    
                    tmp.data.amount_paid = {};
                    tmp.data.amount_paid.value = cashExecution.amount_paid ? parseFloat(cashExecution.amount_paid).toLocaleString() : '';
                    tmp.data.amount_paid.type = 'number';
                    
                    tmp.data.advance_balance = {};
                    tmp.data.advance_balance.value = cashExecution.advance_balance ? parseFloat(cashExecution.advance_balance).toLocaleString() : '';
                    tmp.data.advance_balance.type = 'number';
                    
                    tmp.data.date = {};
                    tmp.data.date.value = date;
                    tmp.data.date.type = 'date';
                    
                    tmp.data.note = {};
                    tmp.data.note.value = cashExecution.note;
                    tmp.data.note.type = 'text';

                    this.data.push(tmp);
                });

                if(resp.data.data.cash_executions.length > 0){
                    i = i + 1;
                    this.loadData(link, i);
                }
                else{
                    let tmp = this.data;

                    this.data = [];

                    tmp.sort((a,b)=>{
                        if(a.id < b.id){
                            return 1;
                        }
                        if(a.id > b.id){
                            return -1;
                        }
                        if(a.id == b.id){
                            return 0;
                        }
                    });

                    tmp[0].isGrey = false;
                    tmp[0].options.splice(0, 0,
                        {
                            id: 'add',
                            text: 'Редактировать',
                            event: this.add
                        }
                    );
                    
                    setTimeout(()=>{
                        this.data = tmp;
                    }, 10);
                }
            });
        }
    },
    created () {
        this.loadData(config.host+'/api/contracts/'+this.$router.history.current.params.id+'/cashExecutions',1);
    }
}
</script>