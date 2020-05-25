<template>
    <div>
        <button v-if="this.role == 1" class="add-row" v-on:click="addGroupQuery">Добавить новую группу УП</button>
        <scroll-bar style="max-height: 50vh;">
            <div v-for="(group, index) in data"
                 :key="index"
                class="group-wrapper" >
                <div 
                    class="group-header"
                    @click="loadUP(index,
                                'group-checker'+index,
                                '',
                                1)"
                >

                    <label v-if="!group.isEdit" class="group-name" :for="'group-checker'+index">
                        {{group.name}}
                    </label>
                    <input :ref="'group-name-input-'+index" v-if="group.isEdit" class="group-name group-name__edit"  type="text" v-model="group.name" />
                    <more-tools v-if="group.options.length > 0" @option-click="groupTools" :options="group.options" :id="group.id" customStyle="display: flex; flex-direction: row;" />
                </div>
                <input :id="'group-checker'+index" :ref="'group-checker'+index" type="checkbox" class="group-checker" />
                <div class="group-content">
                    <table-view :ref="'table'+group.id"
                                @addRow="add(group.id)"
                                @addRowInSubTable="addRaport"
                                @update="update"
                                :headers="group.subTable.headers"
                                :data="group.subTable.rows"
                                :inRowAdd="true"
                                @sort="sort"
                                subTableColumns="grid-template-columns: repeat(3, minmax(300px, 1fr)) 500px repeat(2, minmax(300px, 1fr)) 40px;" /> 
                </div>
            </div>
        </scroll-bar>
    </div>
</template>

<script>
import Vue from 'vue';
import config from '../../../config';
import axios from 'axios';

import ScrollBar from 'vue-custom-scrollbar' 
Vue.component('scroll-bar', ScrollBar)

import MoreTools from '../../../components/more-tools';
Vue.component('more-tools', MoreTools);

import TableView from '../../../components/table-view';
Vue.component('table-view', TableView);

export default {
    data () {
        return {
            data: [],
            groupPreloader: [],
            groupEditId: null,
            role: 0,
            lastAddedId: null,
            lastAddedReportId: null,
            AuthStr: (sessionStorage.getItem('token_type')+' ').concat(sessionStorage.getItem('access_token'))
        }
    },
    methods: {
        sort(sortArray){
            this.data.find((group, i) => {
                if (group.subTable.rows.length != 0) {
                    this.data[i].subTable.rows = [];

                    this.$nextTick().then(()=>{
                        this.data[i].subTable.rows = sortArray;
                    });
                }
            });
        },


        //Группа УП
        addGroupQuery : function(){
            if(this.groupEditId == null){
                axios({
                    method: 'post',
                    url: config.host+'/api/groups',
                    data: 'contract_object_id='+this.$router.history.current.params.idObject,
                    headers: { Authorization: this.AuthStr } }).
                then((resp)=>{
                    this.addGroup(resp.data.data, true);
                });
            }
        },
        groupTools : function(data){
            if(data.data.id == 'edit'){
                this.data.find(elem => {
                    if(elem.id == data.id){
                        elem.isEdit = true;
                        this.groupEditId = elem.id;
                    }
                });
            }
            else{
                this.data.find(elem => {
                    if(elem.id == data.id){
                        if(confirm('Выдействительно хотите удалить группу "'+elem.name+'" и все закрытия УП, закреплённые за этой группой?')){
                            axios({
                                method: 'delete',
                                url: config.host+'/api/groups/'+data.id,
                                headers: { Authorization: this.AuthStr }})
                            .then(() => {
                            })
                            .catch(error => {                        
                                if(error.response.data.error.messages[0] == 'true'){
                                    for(let i = 0; i < this.data.length; i++){
                                        if(this.data[i].id == elem.id){
                                            this.data.splice(i, 1);
                                        }
                                    }
                                }
                                else{
                                    alert('Ошибка!\r\rНе удалось удалить элемент.\r\rИнформация об ошибке:\r'+error);
                                }
                            });
                            
                        }
                    }
                });
            }
        },


        loadUP(id, ref, link, i, formatedData){
            let currentGroup = this.data[id];
            let checkbox = this.$refs[ref];
            let isOpen = false;
            
            if(checkbox == undefined){
                isOpen = false;
            }
            else{
                if(i == 1){
                    isOpen = !checkbox[0].checked;
                }
                else{
                    isOpen = checkbox[0].checked;
                }
            }
            
            if(isOpen){
                if(link == ''){
                    link = config.host+'/api/groups/'+currentGroup.id+'/constructionCertificates';
                }


                if(formatedData == undefined){
                    formatedData = [];
                }
                
                axios({
                    method: 'get',
                    url: link+'?page='+i,
                    headers: { Authorization: this.AuthStr }
                })
                .then(resp => {
                    resp.data.data.construction_certificates.forEach(ccElem => {
                        formatedData.push({
                            id: ccElem.id,
                            options: [
                                {
                                    id: 'edit',
                                    text: 'Редактировать',
                                    event: this.edit
                                }
                            ],
                            data:{
                                number: {
                                    type: 'number',
                                    value: ccElem.number
                                },
                                name: {
                                    type: 'text',
                                    value: ccElem.name
                                },
                                plannedDate: {
                                    type: 'date',
                                    value: ccElem.closing_date_planned != null ? new Date(ccElem.closing_date_planned).toLocaleDateString() : ''
                                },
                                closingDate: {
                                    type: 'date',
                                    value: ccElem.closing_date_real != null ? new Date(ccElem.closing_date_real).toLocaleDateString() : ''
                                },
                                files: {
                                    type: 'files',
                                    value: ccElem.files,
                                    model: 'constructionCertificates'
                                }
                            },
                            subTable: {
                                headers: [
                                    '№ Рапорта/извещения',
                                    'Наименование',
                                    'Действующая документация  ПДСП, РКД',
                                    'Дата предъявления',
                                    'Дата закрытия',
                                    'Фотографии и файлы'

                                ],
                                rows: {}
                            }
                        });

                        if(this.role == 1){
                            formatedData[formatedData.length - 1].options.push(
                                {
                                    id: 'delet',
                                    text: 'Удалить',
                                    event: this.delet
                                }
                            );
                        }

                        formatedData[formatedData.length-1].subTable.rows = [];
                        ccElem.reports.forEach(report => {
                            formatedData[formatedData.length-1].subTable.rows.push({
                                id: report.id,
                                options: [
                                    {
                                        id: 'edit',
                                        text: 'Редактировать',
                                        event: this.editReport
                                    },
                                    {
                                        id: 'editPresentation',
                                        text: 'Редактировать предъявления',
                                        event: this.editPresentation
                                    }
                                ],
                                data: {
                                    number: {
                                        value: report.number,
                                        type: 'text'
                                    },
                                    name: {
                                        value: report.name,
                                        type: 'text'
                                    },
                                    documentation: {
                                        value: report.current_documentation,
                                        type: 'text'
                                    },
                                    presentation: {
                                        value: report.presentations,
                                        type: 'presentation'
                                    },
                                    closingDate: {
                                        value: report.closing_date != null ? new Date(report.closing_date).toLocaleDateString() : '',
                                        type: 'date'
                                    },
                                    files: {
                                        value: report.files,
                                        type: 'files',
                                        model: 'reports'
                                    }
                                }
                            });
                            
                            if(this.role == 1){
                                let position = formatedData[formatedData.length - 1].subTable.rows.length - 1;
                                formatedData[formatedData.length - 1].subTable.rows[position].options.push(
                                    {
                                        id: 'delet',
                                        text: 'Удалить',
                                        event: this.deletReport
                                    }
                                );
                            }
                        });

                        formatedData[formatedData.length-1].subTable.rows.sort((a,b)=>{
                            if(a.id < b.id){
                                return -1;
                            }
                            if(a.id > b.id){
                                return 1;
                            }
                            if(a.id == b.id){
                                return 0;
                            }
                        })
                    });
                    
                    if(resp.data.data.construction_certificates.length > 0){
                        i = i + 1;
                        this.loadUP(id, ref, link, i, formatedData);
                    }
                    else{
                        formatedData.sort((a,b)=>{
                            if(a.id < b.id){
                                return -1;
                            }
                            if(a.id > b.id){
                                return 1;
                            }
                            if(a.id == b.id){
                                return 0;
                            }
                        });
                        currentGroup.subTable.rows = formatedData;
                    }
                });
            }
            else{
                currentGroup.subTable.rows = [];
            }          
        },
        //УП
        add : function(id){
            if(this.lastAddedId==null){
                axios({
                    method: 'post',
                    url: config.host+'/api/constructionCertificates/',
                    data: 'group_id='+id,
                    headers: { Authorization: this.AuthStr } }).
                then((resp)=>{
                    this.lastAddedId = resp.data.data.id;
                    this.data.forEach(elem => {
                        if(elem.id == id)
                        {
                            elem.subTable.rows.push({
                                id: resp.data.data.id,
                                options: [
                                    {
                                        id: 'edit',
                                        text: 'Редактировать',
                                        event: this.edit
                                    }
                                ],
                                data:{
                                    number: {
                                        type: 'text',
                                        value: ''
                                    },
                                    name: {
                                        type: 'text',
                                        value: ''
                                    },
                                    plannedDate: {
                                        type: 'date',
                                        value: ''
                                    },
                                    closingDate: {
                                        type: 'date',
                                        value: ''
                                    },
                                    files: {
                                        type: 'files',
                                        value: '',
                                        model: 'constructionCertificates'
                                    }
                                },
                                subTable: {
                                    headers: [
                                        '№ Рапорта/извещения',
                                        'Наименование',
                                        'Действующая документация  ПДСП, РКД',
                                        'Дата предъявления',
                                        'Дата закрытия',
                                        'Фотографии и файлы'

                                    ],
                                    rows: []
                                }
                            });

                            if(this.role == 1){
                                elem.subTable.rows[elem.subTable.rows.length - 1].options.push(
                                    {
                                        id: 'delet',
                                        text: 'Удалить',
                                        event: this.delet
                                    }
                                );
                            }
                            
                            elem.subTable.rows[elem.subTable.rows.length-1].subTable.rows = [];

                            this.lastAddedId = resp.data.data.id;
                        }
                    });
                });
            }
        },
        edit: function(data, id){
            let paramsList = ['number',
                      'name',
                      'closing_date_planned',
                      'closing_date_real',
                      'files'];
            let paramsString = {};
            data.forEach((elem, i) => {
                if((elem != '' & elem != null & elem != undefined) | (i == 2 | i == 3)){
                    paramsString[paramsList[i]] = elem;
                }
            });
            axios.put(config.host+'/api/constructionCertificates/'+id,
                      paramsString,
                      {headers: { Authorization: this.AuthStr } })
                      .then((resp)=>{
                          this.data.find((elem) => {
                              elem.subTable.rows.forEach(innerElem => {
                                if(innerElem.id == id){
                                    innerElem.data.number.value = resp.data.data.number;
                                    innerElem.data.name.value = resp.data.data.name;

                                    let plannedDate = resp.data.data.closing_date_planned != null ? (new Date(resp.data.data.closing_date_planned)).toLocaleDateString() : '';
                                    let realDate = resp.data.data.closing_date_real != null ? (new Date(resp.data.data.closing_date_real)).toLocaleDateString() : '';

                                    innerElem.data.plannedDate.value = plannedDate;
                                    innerElem.data.closingDate.value = realDate;

                                    innerElem.data.files.value = resp.data.data.files;
                                    
                                    this.lastAddedId = null;
                                }
                              })
                          });
                          
                      }).catch((error) => {
                          alert('Ошибка!\r\rПроверьте введённые данные и повторите попытку.\r\rИнформация об ошибке:\r'+error);
                          this.lastAddedId = id;
                          this.update();
                      });
        },
        delet: function(id){
            if(confirm('Вы действительно хотите удалить эту запись?')){
                axios.delete(config.host+'/api/constructionCertificates/'+id,
                            {headers: { Authorization: this.AuthStr } })
                        .catch((error) => {
                            if(error.response.data.error.messages[0] == 'true'){
                                for(let i = 0; i < this.data.length; i++){
                                    for(let j = 0; j < this.data[i].subTable.rows.length; j++){
                                        if(this.data[i].subTable.rows[j].id == id){
                                            this.data[i].subTable.rows.splice(j, 1);
                                            const tmp = this.data[i].subTable.rows;

                                            this.data[i].subTable.rows = [];

                                            setTimeout(()=>{
                                                this.data[i].subTable.rows = tmp;
                                            },10);
                                        }
                                    }
                                }
                            }
                            else{
                                alert('Ошибка!\r\rНе удалось удалить элемент.\r\rИнформация об ошибке:\r'+error);
                            }
                        });
            }
        },

        //Рапорты
        addRaport(id){
            if(this.lastAddedReportId==null){
                axios({
                    method: 'post',
                    url: config.host+'/api/reports',
                    data: 'construction_certificate_id='+id,
                    headers: { Authorization: this.AuthStr } 
                }).then(resp => {
                    this.data.forEach(elem => {
                        elem.subTable.rows.forEach(innerElem => {
                            if(innerElem.id == id){
                                innerElem.subTable.rows.push({
                                    id: resp.data.data.id,
                                    options: [
                                        {
                                            id: 'edit',
                                            text: 'Редактировать',
                                            event: this.editReport
                                        },
                                        {
                                            id: 'editPresentation',
                                            text: 'Редактировать предъявления',
                                            event: this.editPresentation
                                        }
                                    ],
                                    data: {
                                        number: {
                                            value: '',
                                            type: 'text'
                                        },
                                        name: {
                                            value: '',
                                            type: 'text'
                                        },
                                        documentation: {
                                            value: '',
                                            type: 'text'
                                        },
                                        presentation: {
                                            value: {},
                                            type: 'presentation'
                                        },
                                        closingDate: {
                                            value: null,
                                            type: 'date'
                                        },
                                        files: {
                                            value: [],
                                            type: 'files',
                                            model: 'constructionCertificates'
                                        }
                                    }
                                });
                                
                                if(this.role == 1){
                                    let position = innerElem.subTable.rows.length - 1;
                                    innerElem.subTable.rows[position].options.push(
                                        {
                                            id: 'delet',
                                            text: 'Удалить',
                                            event: this.deletReport
                                        }
                                    );
                                }
                            }
                        });
                    });
                    this.lastAddedReportId = resp.data.data.id;
                    this.update();
                });
            }
        },
        editReport: function(data, id){
            let paramsList = ['number',
                              'name',
                              'current_documentation',
                              'closing_date'];
            let paramsString = {};
            data.forEach((elem, i) => {
                if((elem != '' & elem != null & elem != undefined) | (i == 3)){
                    paramsString[paramsList[i]] = elem;
                }
            });
            
            axios({ method: 'put',
                    url: config.host+'/api/reports/'+id,
                    data:  paramsString,
                    headers: { Authorization: this.AuthStr }})
                      .then((resp)=>{
                          this.data.find((elem) => {
                              elem.subTable.rows.forEach(innerElem => {
                                  innerElem.subTable.rows.forEach(report => {
                                    if(report.id == id){
                                        report.data.number.value = resp.data.data.number;
                                        report.data.name.value = resp.data.data.name;
                                        report.data.documentation.value = resp.data.data.current_documentation;
                                        report.data.presentation.value = resp.data.data.presentations;
                                        report.data.closingDate.value = resp.data.data.closing_date != null ? new Date(resp.data.data.closing_date).toLocaleDateString() : '';
                                        report.data.files.value = resp.data.data.files;
                                        
                                    }
                                  });
                              });
                          });
                                        this.lastAddedReportId = null;
                      }).catch((error) => {
                          alert('Ошибка!\r\rПроверьте введённые данные и повторите попытку.\r\rИнформация об ошибке:\r'+error);
                          this.lastAddedReportId = id;
                          this.update();
                      });
        },
        deletReport(id){
            if(confirm('Вы действительно хотите удалить этот рапорт?')){
                axios({
                    method: 'delete',
                    url: config.host+'/api/reports/'+id,
                    headers: { Authorization: this.AuthStr }
                }).then(()=>{
                }).catch(error=>{
                    if(error.response.data.error.messages[0] == 'true'){
                        for(let i = 0; i < this.data.length; i++){
                            for(let j = 0; j < this.data[i].subTable.rows.length; j++){
                                for(let k = 0; k < this.data[i].subTable.rows[j].subTable.rows.length; k++){
                                    if(this.data[i].subTable.rows[j].subTable.rows[k].id == id){
                                        this.data[i].subTable.rows[j].subTable.rows.splice(k, 1);
                                        const tmp = this.data[i].subTable.rows[j].subTable.rows;

                                        this.data[i].subTable.rows[j].subTable.rows = [];

                                        setTimeout(()=>{
                                            this.data[i].subTable.rows[j].subTable.rows = tmp;
                                        },50);
                                    }
                                }
                            }
                        }
                    }
                    else{
                        alert('Ошибка!\r\rНе удалось удалить элемент.\r\rИнформация об ошибке:\r'+error);
                    }
                });
            }
        },

        editPresentation(id){
            this.$emit('presentation', {id: id, model: 'reports'}, (data)=>{
                this.data.forEach(group=>{
                    group.subTable.rows.forEach(constructionCertificate=>{
                        constructionCertificate.subTable.rows.forEach(report=>{
                            if(report.id == id){
                                report.data.presentation.value = data;
                            }
                        });
                    });
                });
            });
        },

        update: function(){
            if(this.lastAddedId != null){
                this.data.forEach(elem => {
                    elem.subTable.rows.forEach(innerElem => {
                        if(innerElem.id == this.lastAddedId){
                            this.$refs['table'+elem.id][0].$refs[this.lastAddedId][0].isEdit = true;
                            this.$refs['table'+elem.id][0].$refs[this.lastAddedId][0].event = this.edit;
                        }
                    });
                });
            }
            
            if(this.lastAddedReportId != null){
                this.data.forEach(elem => {
                    elem.subTable.rows.forEach(innerElem => {
                        innerElem.subTable.rows.forEach(report => {
                            if(report.id == this.lastAddedReportId){
                                setTimeout(()=>{
                                    this.$refs['table'+elem.id][0].$refs[innerElem.id][0].$refs['subTable'+innerElem.id].$refs[this.lastAddedReportId][0].isEdit = true;
                                    this.$refs['table'+elem.id][0].$refs[innerElem.id][0].$refs['subTable'+innerElem.id].$refs[this.lastAddedReportId][0].event = this.editReport;
                                }, 10);
                            }
                        })
                    });
                });
            }
        },

        addGroup (elem, isEdit) {
            let tmpGroup = {};

            tmpGroup.id = elem.id;
            tmpGroup.name = elem.name;
            tmpGroup.isEdit = false;
            tmpGroup.options = [];
            
            if(this.role == 1){
                tmpGroup.options.push(
                    {
                        id: 'edit',
                        text: 'Редактировать',
                        event: this.groupTools
                    }
                );
                tmpGroup.options.push(
                    {
                        id: 'delet',
                        text: 'Удалить',
                        event: this.groupTools
                    }
                );
            }
            

            tmpGroup.subTable = {
                headers : [
                    '№ УП',
                    'Наименование УП',
                    'Плановая дата закрытия УП',
                    'Дата закрытия УП',
                    'Необходимые файлы'
                    ]
            };

            tmpGroup.subTable.rows = [];

            this.groupPreloader.push(tmpGroup);

            if(isEdit){
                this.data[this.data.length - 1].isEdit = true;
                this.groupEditId = this.data[this.data.length - 1].id;
            }
        },
        addToGroup (parrent, id) {
            parrent.subTable.rows = [];

            axios({
                method: 'get',
                url: config.host+'/api/groups/'+id+'/constructionCertificates',
                headers: { Authorization: this.AuthStr }
            })
            .then(resp => {
                resp.data.data.construction_certificates.forEach(ccElem => {
                    parrent.subTable.rows.splice(parrent.subTable.rows.length,0,{
                        id: ccElem.id,
                        options: [
                            {
                                id: 'edit',
                                text: 'Редактировать',
                                event: this.edit
                            }
                        ],
                        data:{
                            number: {
                                type: 'text',
                                value: ccElem.number
                            },
                            name: {
                                type: 'text',
                                value: ccElem.name
                            },
                            plannedDate: {
                                type: 'date',
                                value: ccElem.closing_date_planned != null ? new Date(ccElem.closing_date_planned).toLocaleDateString() : ''
                            },
                            closingDate: {
                                type: 'date',
                                value: ccElem.closing_date_real != null ? new Date(ccElem.closing_date_real).toLocaleDateString() : ''
                            },
                            files: {
                                type: 'files',
                                value: ccElem.files,
                                model: 'constructionCertificates'
                            }
                        },
                        subTable: {
                            headers: [
                                '№ Рапорта/извещения',
                                'Наименование',
                                'Действующая документация  ПДСП, РКД',
                                'Дата предъявления',
                                'Дата закрытия',
                                'Фотографии и файлы'

                            ],
                            rows: []
                        }
                    });

                    if(this.role == 1){
                        parrent.subTable.rows[parrent.subTable.rows.length - 1].options.push(
                            {
                                id: 'delet',
                                text: 'Удалить',
                                event: this.delet
                            }
                        );
                    }
                    

                    ccElem.reports.forEach(report => {
                        parrent.subTable.rows[parrent.subTable.rows.length-1].subTable.rows = [];
                        parrent.subTable.rows[parrent.subTable.rows.length-1].subTable.rows.push({
                            id: report.id,
                            options: [
                                {
                                    id: 'edit',
                                    text: 'Редактировать',
                                    event: this.editReport
                                }
                                ,
                                {
                                    id: 'editPresentation',
                                    text: 'Редактировать предъявления',
                                    event: this.editPresentation
                                }
                            ],
                            data: {
                                number: {
                                    value: report.number,
                                    type: 'text'
                                },
                                name: {
                                    value: report.name,
                                    type: 'text'
                                },
                                documentation: {
                                    value: report.current_documentation,
                                    type: 'text'
                                },
                                presentation: {
                                    value: report.presentations,
                                    type: 'presentation'
                                },
                                closingDate: {
                                    value: report.closing_date,
                                    type: 'text'
                                },
                                files: {
                                    value: report.files,
                                    type: 'files',
                                    model: 'reports'
                                }
                            }
                        });

                        if(this.role == 1){
                            let firstIndex = parrent.subTable.rows.length - 1;
                            let secondIndex = parrent.subTable.rows[firstIndex].subTable.rows.length -1;
                            parrent.subTable.rows[firstIndex].subTable.rows[secondIndex].options.push(
                                {
                                    id: 'delet',
                                    text: 'Удалить',
                                    event: this.deletReport
                                }
                            );
                        }
                    });

                    this.lastAddedId = ccElem.id;
                });
            });
        },

        loadGroups(link, i){
            axios.get(link+'?page='+i,
                    {headers: { Authorization: this.AuthStr } })
            .then((resp) => {
                resp.data.data.groups.forEach(elem => {
                    this.addGroup(elem, false);
                });
                
                if(resp.data.data.groups.length > 0){
                    i = i + 1;
                    this.loadGroups(link, i);
                }
                else{
                    this.groupPreloader.sort((a,b)=>{
                        if(a.id < b.id){
                            return -1;
                        }
                        if(a.id > b.id){
                            return 1;
                        }
                        if(a.id == b.id){
                            return 0;
                        }
                    });
                    
                    this.data = this.groupPreloader;
                }
            });
        }
    },
    created () {
        this.role = sessionStorage.getItem('role');

        this.loadGroups(config.host+'/api/objects/'+this.$router.history.current.params.idObject+'/groups', 1);
    },
    updated () {
        
        if(this.affterDeleting != null){
            this.data = [];
            setTimeout(()=>{
                this.data = this.affterDeleting;
                this.affterDeleting = null;
            }, 100);
        }

        if(this.groupEditId != null){
            this.data.find(elem => {
                if(elem.id == this.groupEditId){
                    document.onkeypress = (e) => {
                        if(e.keyCode == 13){
                            axios({
                                method: 'put',
                                url: config.host+'/api/groups/'+elem.id,
                                data: 'name='+elem.name,
                                headers: { Authorization: this.AuthStr }})
                            .then(() => {
                                elem.isEdit = false;
                                this.groupEditId = null;
                            });
                        }
                    }
                }
            });
        }
        else{
            document.onkeypress = null;
        }
    }
}
</script>

<style lang="scss">
.group-wrapper {
    position: relative;
    margin: 20px 0;
    border: 1px solid #DCDCE8;
    border-radius: 5px;
    width: calc(100vw - 200px);
    // max-height: calc(100vw - 300px);

    &:hover .table-view_add-row{
        opacity: 1;
    }
}
.group-header {
    display: grid;
    grid-template-columns: 1fr 50px;
    position: relative;
    align-items: center;
    height: 50px;
}
.group-name {
    font-size: 28px;
    color: #2E2E2E;
    padding: 10px;
    cursor: pointer;
    user-select: none;
}
.group-name__edit {
    border: none;
    padding: 5px;
    margin: 5px;
    background-color: #F6F7FB;
    cursor: text;
}
.group-checker{
    display: none;
}
.group-checker:not(:checked) + .group-content {
    margin-top: 0px;
    border-top: 1px solid transparent;
    padding-top: 0px;
    overflow: hidden;
    max-height: 0px;
    opacity: 0;

    transition: all 0.3s;
}
.group-checker:checked + .group-content {
    margin-top: 10px;
    border-top: 1px solid #DCDCE8;
    padding: 10px;
    overflow: hidden;
    max-height: 99999999999px;

    transition: all 0.3s;
}
.group-content {
    position: relative;
    overflow: hidden;
}
</style>