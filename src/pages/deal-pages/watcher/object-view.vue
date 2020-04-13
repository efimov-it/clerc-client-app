<template>
    <div class="watcher-block">
        <tables-view :pages="pages" :currentPage="this.current" />
    </div>
</template>

<script>
import axios from 'axios';
import config from '../../../config';

export default {
    data () {
        return {
            pages: [
                {
                    text: 'Закрытие УП',
                    path: '/watcher/objects/'+this.$router.history.current.params.idObject+
                          '/UP'
                },
                {
                    text: 'Закрытие УШ',
                    path: '/watcher/objects/'+this.$router.history.current.params.idObject+
                          '/USh'
                },
                {
                    text: 'Закрытие УХ',
                    path: '/watcher/objects/'+this.$router.history.current.params.idObject+
                          '/UH'
                }
            ],
            current: 0,
            AuthStr: (sessionStorage.getItem('token_type')+' ').concat(sessionStorage.getItem('access_token'))
        }
    },
    mounted () {
        if(this.$parent.$children[0].data.length <= 1) {
            axios.get(config.host + '/api/objects/'+this.$router.currentRoute.params.idObject,
                      {headers: { Authorization: this.AuthStr } })
            .then(resp => {
                this.$emit('update', {type: 'openObject', value: resp.data.data.name, link: '/watcher/objects/'+this.$router.currentRoute.params.idObject+'/UP'});
            });
        }
    },
    created () {
        const path = this.$router.currentRoute.path;
        if(path.indexOf('/UP') >= 0) {
            this.current = 0;
        }
        if(path.indexOf('/USh') >= 0) {
            this.current = 1;
        }
        if(path.indexOf('/UH') >= 0) {
            this.current = 2;
        }
    }
}
</script>

<style lang="scss">
.watcher-block{
    background-color: #ffffff;
    padding: 20px;
    border-radius: 4px;
}
.main-page-wrapper {
    padding: 25px 60px;
    width: 100vw;
}
.main-page-content {
    height: calc(100% - 120px);
    margin: 40px 0;
}
</style>