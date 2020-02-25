<template>
    <div class="watcher-block">
        <tables-view :pages="pages"/>
    </div>
</template>

<script>
import Vue from 'vue';
import TablesView from '../../../components/tables-view';

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
            ]
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
</style>