<template>
    <div class="table-button-wrap">
        <div><button class="add-row double-table-button" v-on:click="add()">Добавить новую судебную работу</button></div>
        <table-view style="width: auto; height: auto;"
                    ref="table"
                    :headers="headers"
                    @sort="sort"
                    @addRow="add"
                    @update="update"
                    :data="data" />
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
                'Дата',
                'Номер',
                'Наименование искового заявления',
                'Номер судебного дела',
                'Истец',
                'Ответчик',
                'Третьи лица',
                'Предмет спора',
                'Дата судебного заседания',
                'Стадия рассмотрения искового заявления',
                'Результат рассмотрения искового заявления'
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
                axios.post(config.host+'/api/judicialWorks/',
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
                            date : {
                                value: '',
                                type: 'date'
                            },
                            number : {
                                value: '',
                                type: 'text'
                            },
                            name : {
                                value: '',
                                type: 'text'
                            },
                            judicalNumber : {
                                value: '',
                                type: 'text'
                            },
                            plaintiff : {
                                value: '',
                                type: 'text'
                            },
                            defendant : {
                                value: '',
                                type: 'text'
                            },
                            thirdParties : {
                                value: '',
                                type: 'text'
                            },
                            object : {
                                value: '',
                                type: 'text'
                            },
                            judicalDate : {
                                value: '',
                                type: 'date'
                            },
                            stage : {
                                value: '',
                                type: 'text'
                            },
                            result : {
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
            let paramsList = ['statement_claim_date',
                      'statement_claim_number',
                      'statement_claim_name',
                      'court_case_number',
                      'plaintiff',
                      'defendant',
                      'third_parties',
                      'matter_dispute',
                      'court_hearing_date',
                      'statement_claim_status',
                      'statement_claim_result'];
            let paramsString = {};
            data.forEach((elem, i) => {
                if((elem != '' & elem != null & elem != undefined) | (i == 0 | i == 8)){
                    paramsString[paramsList[i]] = elem;
                }
            });
            axios.put(config.host+'/api/judicialWorks/'+id,
                      paramsString,
                      {headers: { Authorization: this.AuthStr }})
                      .then((resp)=>{
                          this.data.find((elem) => {
                              if(elem.id == id){
                                let date = resp.data.data.statement_claim_date != null ? (new Date(resp.data.data.statement_claim_date)).toLocaleDateString() : '';
                                let judicalDate = resp.data.data.court_hearing_date != null ? (new Date(resp.data.data.court_hearing_date)).toLocaleDateString() : '';

                                elem.data.date.value = date;
                                elem.data.number.value = resp.data.data.statement_claim_number;
                                elem.data.name.value = resp.data.data.statement_claim_name;
                                elem.data.judicalNumber.value = resp.data.data.court_case_number;
                                elem.data.plaintiff.value = resp.data.data.plaintiff;
                                elem.data.defendant.value = resp.data.data.defendant;
                                elem.data.thirdParties.value = resp.data.data.third_parties;
                                elem.data.object.value = resp.data.data.matter_dispute;
                                elem.data.judicalDate.value = judicalDate;
                                elem.data.stage.value = resp.data.data.statement_claim_status;
                                elem.data.result.value = resp.data.data.statement_claim_result;
                                
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
                    url: config.host+'/api/judicialWorks/'+id,
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
                headers: { Authorization: this.AuthStr }})
            .then((resp) => {
                if(formatedData == undefined){
                    formatedData = [];
                }
                resp.data.data.judicial_works.forEach(judicalWork => {
                    let tmp = {};

                    tmp.id = judicalWork.id;

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

                    let date = judicalWork.statement_claim_date != null ? (new Date(judicalWork.statement_claim_date)).toLocaleDateString() : '';
                    let judicalDate = judicalWork.court_hearing_date != null ? (new Date(judicalWork.court_hearing_date)).toLocaleDateString() : '';

                    tmp.data = {};
                    
                    tmp.data.date = {};
                    tmp.data.date.value = date;
                    tmp.data.date.type = 'date';
                    
                    tmp.data.number = {};
                    tmp.data.number.value = judicalWork.statement_claim_number;
                    tmp.data.number.type = 'text';
                    
                    tmp.data.name = {};
                    tmp.data.name.value = judicalWork.statement_claim_name;
                    tmp.data.name.type = 'text';
                    
                    tmp.data.judicalNumber = {};
                    tmp.data.judicalNumber.value = judicalWork.court_case_number;
                    tmp.data.judicalNumber.type = 'text';
                    
                    tmp.data.plaintiff = {};
                    tmp.data.plaintiff.value = judicalWork.plaintiff;
                    tmp.data.plaintiff.type = 'text';
                    
                    tmp.data.defendant = {};
                    tmp.data.defendant.value = judicalWork.defendant;
                    tmp.data.defendant.type = 'text';
                    
                    tmp.data.thirdParties = {};
                    tmp.data.thirdParties.value = judicalWork.third_parties;
                    tmp.data.thirdParties.type = 'text';
                    
                    tmp.data.object = {};
                    tmp.data.object.value = judicalWork.matter_dispute;
                    tmp.data.object.type = 'text';
                    
                    tmp.data.judicalDate = {};
                    tmp.data.judicalDate.value = judicalDate;
                    tmp.data.judicalDate.type = 'date';
                    
                    tmp.data.stage = {};
                    tmp.data.stage.value = judicalWork.statement_claim_status;
                    tmp.data.stage.type = 'text';
                    
                    tmp.data.result = {};
                    tmp.data.result.value = judicalWork.statement_claim_result;
                    tmp.data.result.type = 'text';

                    formatedData.push(tmp);
                });
                if(resp.data.data.judicial_works.length > 0){
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
        this.loadData(config.host+'/api/contracts/'+this.$router.history.current.params.id+'/claimWorks',1);
    }
}
</script>