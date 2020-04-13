<template>
    <table-view class="watcher-table" ref="table" @rowClick="rowClick" @addRow="add" @update="update" :headers="infoHeaders" :data="data" />
</template>

<script>
import Vue from 'vue';
import axios from 'axios';
import config from '../../../config';
import scroll from 'vue-custom-scrollbar'
Vue.component('scroll', scroll)
import TablesView from '../../../components/table-view';
Vue.component('tables-view', TablesView);

export default {
    data () {
        return {
            breadCrumbs: [
                'Объекты'
            ],
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
            lastAddedId: null,
            AuthStr: (sessionStorage.getItem('token_type')+' ').concat(sessionStorage.getItem('access_token'))
        }
    },
    methods: {
        rowClick(id){
            let name;
            this.data.forEach(elem=>{
                if(elem.id == id){
                    name = elem.data.name.value;
                }
            });
            this.$emit('update', {type: 'openObject', value: name, link: '/watcher/objects/'+id+'/UP'});
            this.$router.push('/watcher/objects/'+id+'/UP');
        },
        add : function(){
            if(this.lastAddedId == null){
                axios.post(config.host+'/api/objects',
                'contract_id='+this.$router.history.current.params.id,
                {headers: { Authorization: this.AuthStr } }).
                then((resp)=>{
                    this.lastAddedId = resp.data.data.id;
                    this.data.push({
                        id: resp.data.data.id,
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
                });
            }
        },

        update: function(){
            if(this.lastAddedId != null){
                this.$refs.table.$refs[this.lastAddedId][0].isEdit = true;
                this.$refs.table.$refs[this.lastAddedId][0].event = this.edit;
                this.lastAddedId = null;
            }
        },

        edit: function(data, id){
            axios.put(config.host+'/api/objects/'+id,
                      'contract_name='+data[0]+
                      '&building_number='+data[1]+
                      '&name='+data[2]+
                      '&delivery_port='+data[3]+
                      '&registration_port='+data[4]+
                      '&price='+data[5]+
                      '&note='+data[6],
                      {headers: { Authorization: this.AuthStr } })
                      .then((resp)=>{
                          this.data.find((elem) => {
                              if(elem.id == id){
                                elem.data.nameSC.value = resp.data.data.contract_name;
                                elem.data.number.value = resp.data.data.building_number;
                                elem.data.name.value = resp.data.data.name;
                                elem.data.deliveryPort.value = resp.data.data.delivery_port;
                                elem.data.registrationPort.value = resp.data.data.registration_port;
                                elem.data.cost.value = resp.data.data.price ? parseFloat(resp.data.data.price).toLocaleString() : '';
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
                        .then(()=>{
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
            }
        }
    },
    created () {
        axios.get(config.host+'/api/objects',
                  {headers: { Authorization: this.AuthStr } })
        .then((resp) => {
            let formatedData = [];
            resp.data.data.forEach(contractObject => {
                let tmp = {};

                tmp.id = contractObject.id;

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
                tmp.data.cost.value = contractObject.price ? parseFloat(contractObject.price).toLocaleString() : '';
                tmp.data.cost.type = 'number';
                
                tmp.data.note = {};
                tmp.data.note.value = contractObject.note;
                tmp.data.note.type = 'text';

                formatedData.push(tmp);
            });

            this.data = formatedData;
        });
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
.watcher-table{
    background-color: #ffffff;
}
</style>