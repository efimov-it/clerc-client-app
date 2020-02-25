<template>
    <tables-view :pages="pages"/>
</template>

<script>
import Vue from 'vue';
import TablesView from '../../../components/tables-view';

export default {
    data () {
        return {
            pages: [
                {
                    text: 'Об объекте',
                    path: '/deal/'+this.$router.history.current.params.id+
                          '/objects/'+this.$router.history.current.params.idObject+
                          '/about'
                },
                {
                    text: 'Наблюдатели',
                    path: '/deal/'+this.$router.history.current.params.id+
                          '/objects/'+this.$router.history.current.params.idObject+
                          '/watchers'
                },
                {
                    text: 'Закрытие УП',
                    path: '/deal/'+this.$router.history.current.params.id+
                          '/objects/'+this.$router.history.current.params.idObject+
                          '/UP'
                },
                {
                    text: 'Закрытие УШ',
                    path: '/deal/'+this.$router.history.current.params.id+
                          '/objects/'+this.$router.history.current.params.idObject+
                          '/USh'
                },
                {
                    text: 'Закрытие УХ',
                    path: '/deal/'+this.$router.history.current.params.id+
                          '/objects/'+this.$router.history.current.params.idObject+
                          '/UH'
                }
            ]
        }
    }
}
</script>

<style lang="scss">

</style>