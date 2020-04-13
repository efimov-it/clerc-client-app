<template>
    <div class="table-button-wrap">
        <div><button class="add-row" v-on:click="add()">Добавить новую гарантию</button></div>
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
                'Сумма',
                'Дата',
                'Номер',
                'Срок действия',
                'Кто выдал',
                'Дата последнего изменения',
                'Примечание'
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
                axios.post(config.host+'/api/bankGuarantees/',
                'contract_id='+this.$router.history.current.params.id,
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
                                id: 'delet',
                                text: 'Удалить',
                                event: this.delet
                            }],
                        data: {
                            amount : {
                                value: '',
                                type: 'number'
                            },
                            date : {
                                value: '',
                                type: 'date'
                            },
                            number : {
                                value: '',
                                type: 'text'
                            },
                            validity : {
                                value: '',
                                type: 'date'
                            },
                            issuedBy : {
                                value: '',
                                type: 'text'
                            },
                            last : {
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
            let paramsList = [
                                'amount',
                                'date',
                                'number',
                                'validity',
                                'issued_by',
                                'last_modified_date',
                                'note'];
            let paramsString = {};
            data.forEach((elem, i) => {
                if((elem != null & elem != '' & elem != undefined) | (i == 1 | i == 3 | i == 5)){
                    paramsString[paramsList[i]] = elem;
                }
            });
            axios.put(config.host+'/api/bankGuarantees/'+id,
                      paramsString,
                      {headers: { Authorization: this.AuthStr } })
                      .then((resp)=>{
                          this.data.find((elem) => {
                              if(elem.id == id){
                                let date = resp.data.data.date != null ? (new Date(resp.data.data.date)).toLocaleDateString() : '';
                                let validity = resp.data.data.validity != null ? (new Date(resp.data.data.validity)).toLocaleDateString() : '';
                                let last = resp.data.data.last_modified_date != null ? (new Date(resp.data.data.last_modified_date)).toLocaleDateString() : '';

                                elem.data.amount.value = resp.data.data.amount;
                                elem.data.date.value = date;
                                elem.data.number.value = resp.data.data.number;
                                elem.data.validity.value = validity;
                                elem.data.issuedBy.value = resp.data.data.issued_by;
                                elem.data.last.value = last;
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

        delet: function(id){
            if(confirm('Вы действительно хотите удалить эту запись?')){
                axios.delete(config.host+'/api/bankGuarantees/'+id,
                            {headers: { Authorization: this.AuthStr } })
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
            axios.get(link+'?page='+i,
                    {headers: { Authorization: this.AuthStr } })
            .then((resp) => {
                if(formatedData == undefined){
                    formatedData = [];
                }
                
                resp.data.data.bank_guarantees.forEach(bankGuarantees => {
                    let tmp = {};

                    tmp.id = bankGuarantees.id;

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

                    let date = bankGuarantees.date != null ? (new Date(bankGuarantees.date)).toLocaleDateString() : '';
                    let validity = bankGuarantees.validity != null ? (new Date(bankGuarantees.validity)).toLocaleDateString() : '';
                    let last = bankGuarantees.last_modified_date != null ? (new Date(bankGuarantees.last_modified_date)).toLocaleDateString() : '';

                    tmp.data = {};
                    
                    tmp.data.amount = {};
                    tmp.data.amount.value = bankGuarantees.amount ? parseFloat(bankGuarantees.amount).toLocaleString() : '';
                    tmp.data.amount.type = 'number';
                    
                    tmp.data.date = {};
                    tmp.data.date.value = date;
                    tmp.data.date.type = 'date';
                    
                    tmp.data.number = {};
                    tmp.data.number.value = bankGuarantees.number;
                    tmp.data.number.type = 'text';
                    
                    tmp.data.validity = {};
                    tmp.data.validity.value = validity;
                    tmp.data.validity.type = 'date';
                    
                    tmp.data.issuedBy = {};
                    tmp.data.issuedBy.value = bankGuarantees.issued_by;
                    tmp.data.issuedBy.type = 'text';
                    
                    tmp.data.last = {};
                    tmp.data.last.value = last;
                    tmp.data.last.type = 'date';
                    
                    tmp.data.note = {};
                    tmp.data.note.value = bankGuarantees.note;
                    tmp.data.note.type = 'text';

                    formatedData.push(tmp);
                });

                if(resp.data.data.bank_guarantees.length > 0){
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
        this.loadData(config.host+'/api/contracts/'+this.$router.history.current.params.id+'/bankGuarantees',1)
    }
}
</script>