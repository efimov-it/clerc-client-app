<template>
    <div class="table-button-wrap">
        <div><button class="add-row" v-on:click="add">Добавить новый объект</button></div>
        <div class="table-wrapper">
            <table-view ref="table" @sort="sort" @rowClick="rowClick" @addRow="add" @update="update" :headers="infoHeaders" :data="data" />
        </div>
    </div>
</template>

<script>
import Vue from 'vue';
import config from '../../config';
import axios from 'axios';
import scroll from 'vue-custom-scrollbar'
Vue.component('scroll', scroll)
import TablesView from '../../components/tables-view';
Vue.component('tables-view', TablesView);

export default {
    data () {
        return {
            infoHeaders : [
            'Наименование объекта по ГК',
            'Строительный номер',
            'Название',
            'Порт поставки',
            'Порт регистрации',
            'Стоимость (₽)',
            'Примечание'
            ],
            data : [],
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
        rowClick(id){
            this.$router.push('/deal/'+this.$router.history.current.params.id+'/objects/'+id+'/about');
        },
        add : function(data){
            if(this.lastAddedId == null){
                axios.post(config.host+'/api/objects',
                'contract_id='+this.$router.history.current.params.id,
                {headers: { Authorization: this.AuthStr } }).
                then((resp)=>{
                    this.lastAddedId = resp.data.data.id;
                    // let tmpData = this.data;
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
                            nameSC : {
                                value: '',
                                type: 'text'
                            },
                            number : {
                                value: '',
                                type: 'text'
                            },
                            name : {
                                value: '',
                                type: 'text'
                            },
                            deliveryPort : {
                                value: '',
                                type: 'text'
                            },
                            registrationPort : {
                                value: '',
                                type: 'text'
                            },
                            cost : {
                                value: '',
                                type: 'number'
                            },
                            note : {
                                value: '',
                                type: 'text'
                            }
                        }
                    });
                    // this.affterDeleting = tmpData;
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
                this.lastAddedId = null;
            }
        },

        edit: function(data, id){
            let paramsList = ['contract_name',
                      'building_number',
                      'name',
                      'delivery_port',
                      'registration_port',
                      'price',
                      'note'];
                      let paramsString = '';
            data.forEach((elem, i) => {
                if(elem != null & elem != '' & elem != undefined){
                    paramsString += '&'+paramsList[i]+'='+elem;
                }
            });
            axios.put(config.host+'/api/objects/'+id,
                      paramsString.substring(1),
                      {headers: { Authorization: this.AuthStr } })
                      .then((resp)=>{
                          this.data.find((elem) => {
                              if(elem.id == id){
                                elem.data.nameSC.value = resp.data.data.contract_name;
                                elem.data.number.value = resp.data.data.building_number;
                                elem.data.name.value = resp.data.data.name;
                                elem.data.deliveryPort.value = resp.data.data.delivery_port;
                                elem.data.registrationPort.value = resp.data.data.registration_port;
                                elem.data.cost.value = resp.data.data.price != null ? parseFloat(resp.data.data.price).toLocaleString() : '';
                                elem.data.note.value = resp.data.data.note;
                              }
                          });
                          
                      }).catch((error) => {
                          alert('Ошибка!\r\rПроверьте введённые данные и повторите попытку.\r\rИнформация об ошибке:\r'+error);
                          this.lastAddedId = id;
                          this.update();
                      });
        },

        delet: function(id){
            if(confirm('Вы действительно хотите удалить этот объект?')){
                axios.delete(config.host+'/api/objects/'+id,
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
                                };
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

                resp.data.data.contract_objects.forEach(contractObject => {
                    let tmp = {};

                    tmp.id = contractObject.id;

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
                    
                    tmp.data.nameSC = {};
                    tmp.data.nameSC.value = contractObject.contract_name;
                    tmp.data.nameSC.type = 'text';
                    
                    tmp.data.number = {};
                    tmp.data.number.value = contractObject.building_number;
                    tmp.data.number.type = 'text';
                    
                    tmp.data.name = {};
                    tmp.data.name.value = contractObject.name;
                    tmp.data.name.type = 'text';
                    
                    tmp.data.deliveryPort = {};
                    tmp.data.deliveryPort.value = contractObject.delivery_port;
                    tmp.data.deliveryPort.type = 'text';
                    
                    tmp.data.registrationPort = {};
                    tmp.data.registrationPort.value = contractObject.registration_port;
                    tmp.data.registrationPort.type = 'text';
                    
                    tmp.data.cost = {};
                    tmp.data.cost.value = contractObject.price != null ? parseFloat(contractObject.price).toLocaleString() : '';
                    tmp.data.cost.type = 'number';
                    
                    tmp.data.note = {};
                    tmp.data.note.value = contractObject.note;
                    tmp.data.note.type = 'text';

                    formatedData.push(tmp);
                });

                if(resp.data.data.contract_objects.length > 0){
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
        this.loadData(config.host+'/api/contracts/'+this.$router.history.current.params.id+'/contractObjects', 1);
    }
}
</script>

<style lang="scss">

</style>