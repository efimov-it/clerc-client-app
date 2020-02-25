<template>
    <div :class="'tab-view_tabs-item' + [selected ? ' tab-view_tabs-item__active' : '']" v-on:click="tabClick(data.id)">
        {{data.name}}
    </div>
</template>

<script>
export default {
    props: ['data'],
    data () {
        return {
            selected: false
        }
    },
    methods : {
        tabClick(id){
            this.selected = true;
            this.$emit('tabClick', id);
        }
    }
}
</script>

<style lang="scss">
.tab-view_tabs-item{
    background-color: #EFEFF4;
    border-radius: 5px;
    padding: 20px 20px 30px 20px;
    font-size: 16px;
    color: #8C8C98;
    cursor: pointer;

    &:not(:last-child){
        margin-right: 6px;
    }

    &__active{
        color: #2E2E2E;
        background-color: #ffffff;
    }
}
</style>