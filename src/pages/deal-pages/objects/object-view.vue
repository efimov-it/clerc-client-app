<template>
    <tables-view :pages="pages" :currentPage="this.current" />
</template>

<script>
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
            ],
            current: 0
        }
    },
    created () {
        const path = this.$router.currentRoute.path;
        if(path.indexOf('/about') >= 0) {
            this.current = 0;
        }
        if(path.indexOf('/watchers') >= 0) {
            this.current = 1;
        }
        if(path.indexOf('/UP') >= 0) {
            this.current = 2;
        }
        if(path.indexOf('/USh') >= 0) {
            this.current = 3;
        }
        if(path.indexOf('/UH') >= 0) {
            this.current = 4;
        }
    }
}
</script>

<style lang="scss">

</style>