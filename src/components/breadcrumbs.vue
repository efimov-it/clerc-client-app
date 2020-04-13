<template>
    <div class="breadcrumbs">
        <a :style="'visibility: ' + [data.length > 1 ? 'visible' : 'hidden']" v-on:click="goToMain()" class="back-link breadcrumbs_back-link">На главную</a>
        <ul class="breadcrumbs_list">
            <li v-for="(item, index) in data" :key="index" @click="index == 0 ? goToMain : (index < data.length - 1 ? goToLink(item.link, index) : '')">
                {{item.name}}
            </li>
        </ul>
    </div>    
</template>

<script>
import router from '../router'
export default {
    props: ['data'],
    data () {
        return {
            
        }
    },
    methods: {
        goToMain : function(){
            this.$emit('goToMain');
            if(sessionStorage.getItem('role')==1){
                router.push('/main/');
            }
            else{
                router.push('/watcher/objects/');
            }
        },
        goToLink(link, index){
            this.$emit('updateLinks', index);
            router.push(link)
        }
    }
}
</script>

<style lang="scss">
.breadcrumbs{
    display: grid;
    grid-template-rows: 20px auto;

    &_back-link{
        margin-bottom: 5px;
        width: 150px;
    }
    &_list{
        font-size: 28px;
        color: #2E2E2E;
        list-style: none;
        display: flex;
        flex-direction: row;

        li{
            font-weight: lighter;
            display: flex;
            align-items: center;
            cursor: default;
        }

        li:not(:first-child)::before{
            content: '';
            width: 3px;
            height: 3px;
            border-radius: 1.5px;
            background-color: #2E2E2E;
            position: absolute;
            margin-left: -10px;
        }

        li:not(:last-child){
            margin-right: 23px;
        }

        li:first-child{
            font-weight: bold;
        }

        li:last-child:not(:first-child){
            color: #5361FF;
            text-decoration: underline;
        }
    }
}
</style>