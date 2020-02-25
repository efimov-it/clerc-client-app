<template>
    <div v-if="data != null" :class="'modal-wrapper '+[isActive?' modal-wrapper__active':'']">
        <div class="modal-dark-background"></div>
        <div class="modal-window">
            <header class="modal-window_header">{{data.title}} | Редактирование предъявлений <button @click="close" class="modal-window_close"></button></header>
            <div class="presentation-form">
                <div class="presentation-form_date-list">
                    <div v-for="(date, index) in data.values" :class="'presentation-form_date '+[index == current? 'presentation-form_date__selected' : '']">
                        <input ref="currentDate" @keyup="dateEdit" v-if="date.isEdit" class="table-view_cell" type="date" :value="date.value" />
                        <span @click="dateClick(index)" v-else class="table-view_cell" >{{date.value}}</span>
                        <more-tools @option-click="option" :id="date.id" :options="date.options" class="presentation-form_tools" />
                    </div>
                    <button @click="addNewDate" class="add-row">Добавить новую дату предъявления</button>
                </div>
                <div v-if="data.values != null & data.values != [] & data.values[current] != undefined" class="presentation-form_text-list">
                    <div v-for="(text, index) in data.values[current].texts" class="presentation-form_text">
                        <input ref="currentNote" @keyup="textEdit" v-if="text.isEdit" class="table-view_cell" type="text" :value="text.value" />
                        <span ref="notes" v-else class="table-view_cell" >{{text.value}}</span>
                        <more-tools @option-click="option" :id="index" :options="text.options" />
                    </div>
                    <button @click="addNewNote" class="add-row">Добавить новое предъявление</button>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import Axios from 'axios';
import config from '../config';
export default {
    data(){
        return {
            dateEditId: null,
            noteEditId: null,
            isActive: false,
            id: null,
            model: null,
            data: null,
            current: 0,
            callback: null,
            AuthStr: (sessionStorage.getItem('token_type')+' ').concat(sessionStorage.getItem('access_token'))
        }
    },
    methods: {
        close(){
            let resultData = [];
            this.data.values.forEach(elem=>{
                elem.value = elem.value.split('.')
                resultData.push({
                    date: elem.value[2]+'-'+elem.value[1]+'-'+elem.value[0],
                    note: []
                });
                elem.texts.forEach(note=>{
                    resultData[resultData.length - 1].note.push(note.value);
                });
                resultData[resultData.length - 1].note = JSON.stringify(resultData[resultData.length - 1].note);
            });
            this.callback(resultData);
            this.isActive = false;
            this.id = null;
            this.model = null;
            this.data = null;
            this.current = 0;
            this.dateEditId = null;
            this.noteEditId = null;
        },

        option(option){
            option.data.event(option.id);
        },

        loadData(){
            Axios({
                method: 'get',
                url: config.host+'/api/'+this.model+'/'+this.id+'/',
                headers: { Authorization: this.AuthStr }
            }).then(resp=>{
                this.data = {
                    title: ''
                }
                if(this.model == 'reports'){
                    Axios({
                        method: 'get',
                        url: config.host+'/api/constructionCertificates/'+resp.data.data.construction_certificate_id,
                        headers: { Authorization: this.AuthStr }
                    }).then(resp=>{
                        this.data.title = 'УП № '+resp.data.data.number
                    });
                }
                else{
                    if(this.model == 'mooringCertificates'){
                        this.data.title = 'УШ № '+resp.data.data.number
                    }
                    else{
                        this.data.title = 'УХ № '+resp.data.data.number
                    }
                }
                this.data.values = [];
                resp.data.data.presentations.forEach(elem => {

                    let notes = JSON.parse(elem.note);
                    let texts = [];

                    if(notes){
                        notes.forEach(note => {
                            if(note){
                                texts.push({
                                    isEdit: false,
                                    value: note,
                                    options: [
                                        {
                                            id: 'edit',
                                            text: 'Редактировать',
                                            event: this.editNote
                                        },
                                        {
                                            id: 'delet',
                                            text: 'Удалить',
                                            event: this.deleteNote
                                        }
                                    ]
                                });
                            }
                        });
                    }
                    this.data.values.push({
                        id: elem.id,
                        value: new Date(JSON.parse(elem.date)).toLocaleDateString(),
                        texts: texts,
                        isEdit: false,
                        options: [
                            {
                                id: 'edit',
                                text: 'Редактировать',
                                event: this.editPresentation
                            },
                            {
                                id: 'delet',
                                text: 'Удалить',
                                event: this.deletePresentation
                            }
                        ]
                    })
                });
            });
        },


        addNewDate(){
            if(this.dateEditId == null){
                if(this.data.values == undefined){
                    this.data.values = [];
                }
                this.data.values.push({
                    id: -1,
                    value: '',
                    texts: [],
                    isEdit: true,
                    options: [
                        {
                            id: 'edit',
                            text: 'Редактировать',
                            event: this.editPresentation
                        },
                        {
                            id: 'delet',
                            text: 'Удалить',
                            event: this.deletePresentation
                        }
                    ]
                });
                let tmp = this.data;
                this.data = null;
                this.data = tmp;

                this.dateEditId = -1;
            }
        },
        dateEdit(e){
            if(e.code == 'Enter'){
                if(this.$refs.currentDate[0].value != ''){
                    let model_type;
                    switch(this.model){
                        case 'mooringCertificates':
                            model_type = 'mooring_certificates';
                        break;
                        case 'travelingCertificates':
                            model_type = 'traveling_certificates';
                        break;
                        case 'reports':
                            model_type = 'reports';
                        break;
                    }
                    Axios({
                        method: this.dateEditId == -1 ? 'post' : 'put',
                        url: config.host+'/api/presentations/'+(this.dateEditId == -1 ? '' : this.dateEditId),
                        data: 'model_id='+this.id+
                            '&model_type='+model_type+
                            '&date='+JSON.stringify(this.$refs.currentDate[0].value),
                        headers: { Authorization: this.AuthStr }
                    }).then(resp => {
                        let dateIndex;
                        if(this.dateEditId == -1){
                            dateIndex = this.data.values.length - 1;
                        }
                        else{
                            this.data.values.forEach((elem, index) => {
                                if(elem.id == this.dateEditId){
                                    dateIndex = index;
                                }
                            });
                        }
                        this.data.values[dateIndex].id = resp.data.data.id;
                        this.data.values[dateIndex].value = new Date(this.$refs.currentDate[0].value).toLocaleDateString();
                        this.data.values[dateIndex].isEdit = false;
                        this.dateEditId = null;

                        let tmp = this.data;
                        this.data = null;
                        this.data = tmp;
                    });
                }
                else{
                    alert('Вы забыли указать дату.');
                }
            }
            if(e.code == 'Escape'){
                if(this.data.values[this.data.values.length - 1].id){
                    this.data.values.splice(this.data.values.length - 1, 1);
                }
                else{
                    this.data.values[this.data.values.length - 1].isEdit = false;
                }
                this.dateEditId = null;

                let tmp = this.data;
                this.data = null;
                this.data = tmp;
            }
        },
        editPresentation(id){
            this.dateEditId = id;
            this.data.values.forEach(elem=>{
                if(elem.id == id){
                    elem.isEdit = true;

                    let tmp = this.data;
                    this.data = null;
                    this.data = tmp;
                }
            });
        },
        deletePresentation(id){
            this.data.values.forEach((elem, index) => {
                if(elem.id == id){
                    if(confirm('Вы действительно хотите удалить предъявление от "'+elem.value+'"?')){
                        Axios({
                            method: 'delete',
                            url: config.host+'/api/presentations/'+id,
                            headers: { Authorization: this.AuthStr }
                        }).then().catch(error => {
                            if(error.response.data.error.messages[0] == 'true'){
                                for(let i = 0; i < this.data.values.length; i++){
                                    if(this.data.values[i].id == id){
                                        this.data.values.splice(i, 1);
                                        
                                        let tmp = this.data;
                                        this.data = null;
                                        this.data = tmp;
                                    }
                                }
                            }
                            else{
                                alert('Ошибка!\r\rНе удалось удалить предъявление.\r\rИнформация об ошибке:\r'+error);
                            }
                        });
                    }
                }
            });
        },


        dateClick(index){
            if(this.noteEditId == null){
                this.current = index;
            }
            else{
                alert('Пожалуйста, закончите редактирование предъявления');
            }
        },


        addNewNote(){
            if(this.noteEditId == null){
                this.noteEditId = -1;
                this.data.values.forEach((elem, index) => {
                    if(index == this.current){
                        if(elem.texts == undefined){
                            elem.texts = [];
                        }
                        
                        elem.texts.push({
                            value: '',
                            isEdit: true,
                            options: [
                                {
                                    id: 'edit',
                                    text: 'Редактировать',
                                    event: this.editNote
                                },
                                {
                                    id: 'delet',
                                    text: 'Удалить',
                                    event: this.deleteNote
                                }
                            ]
                        });

                        let tmp = this.data;
                        this.data = null;
                        this.data = tmp;
                    }
                })
            }
        },
        textEdit(e){
            if(e.code == 'Enter'){
                this.data.values[this.current]
                .texts[this.data.values[this.current].texts.length - 1].value = this.$refs.currentNote[0].value;

                this.checngeNotes((resp)=>{
                    let noteIndex;
                    if(this.noteEditId == -1){
                        noteIndex = this.data.values[this.current].texts.length - 1;
                    }
                    else{
                        noteIndex = this.noteEditId;
                    }

                    this.data.values[this.current].texts[noteIndex].isEdit = false;
                    this.noteEditId = null;

                    let tmp = this.data;
                    this.data = null;
                    this.data = tmp;
                })
            }
        },
        checngeNotes(callback){
            let newTexts = [];
            
            this.data.values[this.current].texts.forEach(elem=>{
                newTexts.push(elem.value);
            });
            
            let model_type;
            switch(this.model){
                case 'mooringCertificates':
                    model_type = 'mooring_certificates';
                break;
                case 'travelingCertificates':
                    model_type = 'traveling_certificates';
                break;
                case 'reports':
                    model_type = 'reports';
                break;
            }

            Axios({
                method: 'put',
                url: config.host+'/api/presentations/'+this.data.values[this.current].id,
                data: 'model_id='+this.id+
                        '&model_type='+model_type+
                        '&note='+JSON.stringify(newTexts),
                headers: { Authorization: this.AuthStr }
            }).then(resp => {
                callback(resp);
            });
        },
        editNote(id){
            console.log(this.data.values[this.current].texts[id]);
            this.data.values[this.current].texts[id].isEdit = true;
            this.noteEditId = id;
            
            let tmp = this.data;
            this.data = null;
            this.data = tmp;
        },
        deleteNote(id){
            if(confirm('Вы действительно хотите удалить запись предъявления?\r\rСодержание:\r'+this.data.values[this.current].texts[id].value)){
                this.data.values[this.current].texts.splice(id, 1);

                this.checngeNotes(()=>{
                    let tmp = this.data;
                    this.data = null;
                    this.data = tmp;
                });
            }
        }
    }
}
</script>

<style lang="scss">
.modal-wrapper {
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    display: none;
    z-index: 1000;

    &__active{
        display: flex;
    }
}
.modal-dark-background {
    background-color: rgba(7, 0, 48, 0.56);
    position: absolute;
    width: 100vw;
    height: 100vh;
    z-index: 100;
}
.modal-window {
    width: 100vw;
    height: 100vh;
    max-width: 60vw;
    max-height: 60vh;
    background-color: #ffffff;
    z-index: 101;
    position: absolute;
    border-radius: 10px;
    box-shadow: 0px 10px 40px #5361ff36;
    
    &_header {
        padding: 30px;
        display: grid;
        grid-template-columns: 1fr 30px;
        align-items: center;
        height: 90px;
        border-bottom: 1px solid #e9e9e9;
        font-size: 20px;
    }
    &_close {
        height: 100%;
        width: 100%;
        border: none;
        background-color: transparent;
        background-image: url('../assets/remove.svg');
        background-repeat: no-repeat;
        background-size: contain;
    }
}
.presentation-form {
    padding: 30px;
    display: grid;
    grid-template-columns: 1fr 2fr;
    height: calc(100% - 90px);
    grid-gap: 30px;

    &_text-list,
    &_date-list {
        overflow-y: auto;
    }

    &_date {
        margin-bottom: 10px;
        display: grid;
        height: 70px;
        align-items: center;
        position: relative;
        padding-right: 80px;
        transition: all 0.3s;
        cursor: pointer;
        border-radius: 5px;
        
        &:hover {
            background-color: #5361ff;

            & *:not(input){
                color: #ffffff;
            }
        }
        
        &__selected {
            background-color: #5361ff;

            & *:not(input){
                color: #ffffff;
            }
        }
    }
    
    &_text {
        margin-bottom: 10px;
        display: grid;
        height: 70px;
        align-items: center;
        position: relative;
    }

    &_tools {
        margin: 0;
    }
}
</style>