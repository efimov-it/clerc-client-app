<template>
    <div style="height: 100%; display: grid; grid-template-rows: auto 1fr;">
        <div><button class="add-row" v-on:click="add()">Добавить новый этап</button></div>
        <div class="table-wrapper">
            <table-view
                ref="table"
                :headers="headers"
                @sort="sort"
                @addRow="add"
                @update="update"
                :data="data"
                groupBy="objectName"
                sortBy="dateEndPlan"
            />
        </div>
    </div>
</template>

<script>
import Vue from 'vue';
import axios from 'axios';
import config from '../../config';

import TableView from '../../components/table-view';
Vue.component('table-view', TableView);

export default {
    data () {
        return {
            headers : [
                'Наименование объекта по ГК',
                'Наименование этапа',
                'Стоимость этапа',
                'Дата начала',
                'Дата окончания (план)',
                'Дата окончания (факт)',
                'Обоснование',
                'Примечание'
            ],
            data: [],
            newKeyEventsId: null,
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
                axios.post(config.host+'/api/paymentStages',
                'contract_id='+this.$router.history.current.params.id,
                {headers: { Authorization: this.AuthStr }}).
                then((resp)=>{
                    axios.post(config.host+'/api/keyEvents',
                    'contract_id='+this.$router.history.current.params.id,
                    {headers: { Authorization: this.AuthStr }}).
                    then((resp)=>{
                        this.newKeyEventsId = resp.data.data.id;
                    });

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
                            objectName : {
                                value: '',
                                type: 'text'
                            },
                            stageName : {
                                value: '',
                                type: 'text'
                            },
                            amount : {
                                value: '',
                                type: 'number'
                            },
                            dateStart : {
                                value: '',
                                type: 'date'
                            },
                            dateEndPlan : {
                                value: '',
                                type: 'date'
                            },
                            dateEndReal : {
                                value: '',
                                type: 'date'
                            },
                            rationale : {
                                value: '',
                                type: 'text'
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
            let paramsList=['object_name',
                      'name',
                      'amount',
                      'start_date',
                      'expiration_date_planned',
                      'expiration_date_real',
                      'rationale',
                      'note'];
            let paramsString = {};
            let keyEventsParams = {};
            data.forEach((elem, i) => {
                if((elem != '' & elem != null & elem != undefined) | (i == 3 | i == 4 | i == 5)){
                    paramsString[paramsList[i]] = elem;
                }

                if(this.newKeyEventsId != null){
                    if(i != 2){
                        if((elem != '' & elem != null & elem != undefined) | (i == 3 | i == 4 | i == 5)){
                            keyEventsParams[paramsList[i]] = elem;
                        }
                    }
                }
            });
            axios.put(config.host+'/api/paymentStages/'+id,
                      paramsString,
                      {headers: { Authorization: this.AuthStr }})
                      .then((resp)=>{

                          if(this.newKeyEventsId){
                            axios.put(config.host+'/api/keyEvents/'+this.newKeyEventsId,
                                keyEventsParams,
                                {headers: { Authorization: this.AuthStr }})
                                .then(()=>{

                                });
                          }
                          this.data.find((elem) => {
                              if(elem.id == id){
                                elem.data.objectName.value = resp.data.data.object_name;
                                elem.data.stageName.value = resp.data.data.name;
                                elem.data.amount.value = resp.data.data.amount ? parseFloat(resp.data.data.amount).toLocaleString() : '';

                                let startDate = resp.data.data.start_date != null ? (new Date(resp.data.data.start_date)).toLocaleDateString() : '';
                                let plannedDate = resp.data.data.expiration_date_planned != null ? (new Date(resp.data.data.expiration_date_planned)).toLocaleDateString() : '';
                                let realDate = resp.data.data.expiration_date_real != null ? (new Date(resp.data.data.expiration_date_real)).toLocaleDateString() : '';

                                elem.data.dateStart.value = startDate;
                                elem.data.dateEndPlan.value = plannedDate;
                                elem.data.dateEndReal.value = realDate;

                                elem.data.note.value = resp.data.data.note;
                                elem.data.rationale.value = resp.data.data.rationale;
                                
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
            if(confirm('Вы действительно хотите удалить данную запись?')){
                axios({
                    method: 'delete',
                    url: config.host+'/api/paymentStages/'+id,
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
                    formatedData =[];
                }
                resp.data.data.payment_stages.forEach(paymentStages => {
                    let tmp = {};

                    tmp.id = paymentStages.id;

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

                    let startDate = paymentStages.start_date != null ? (new Date(paymentStages.start_date)).toLocaleDateString() : '';
                    let plannedDate = paymentStages.expiration_date_planned != null ? (new Date(paymentStages.expiration_date_planned)).toLocaleDateString() : '';
                    let realDate = paymentStages.expiration_date_real != null ? (new Date(paymentStages.expiration_date_real)).toLocaleDateString() : '';

                    tmp.data = {};
                    
                    tmp.data.objectName = {};
                    tmp.data.objectName.value = paymentStages.object_name;
                    tmp.data.objectName.type = 'text';
                    
                    tmp.data.stageName = {};
                    tmp.data.stageName.value = paymentStages.name;
                    tmp.data.stageName.type = 'text';
                    
                    tmp.data.amount = {};
                    tmp.data.amount.value = paymentStages.amount ? parseFloat(paymentStages.amount).toLocaleString() : '';
                    tmp.data.amount.type = 'number';
                    
                    tmp.data.dateStart = {};
                    tmp.data.dateStart.value = startDate;
                    tmp.data.dateStart.type = 'date';
                    
                    tmp.data.dateEndPlan = {};
                    tmp.data.dateEndPlan.value = plannedDate;
                    tmp.data.dateEndPlan.type = 'date';
                    
                    tmp.data.dateEndReal = {};
                    tmp.data.dateEndReal.value = realDate;
                    tmp.data.dateEndReal.type = 'date';
                    
                    tmp.data.rationale = {};
                    tmp.data.rationale.value = paymentStages.rationale;
                    tmp.data.rationale.type = 'text';
                    
                    tmp.data.note = {};
                    tmp.data.note.value = paymentStages.note;
                    tmp.data.note.type = 'text';

                    formatedData.push(tmp);
                });

                if(resp.data.data.payment_stages.length > 0){
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
        this.loadData(config.host+'/api/contracts/'+this.$router.history.current.params.id+'/paymentStages',1);
    }
}
</script>