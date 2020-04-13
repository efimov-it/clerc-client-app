<template>
    <div :class="'more-tools' + [state ? ' more-tools__active' : '']" v-on:click="state = !state" v-on:mouseleave="state = false">
        <ul class="more-tools_list" :style="customStyle?customStyle:''">
            <li v-for="(option, i) in this.options"
                :key="i"
                :class="'more-tools_list-item more-tools_list-item__' + option.id" 
                v-on:click="setClick(option)"
                :style="customStyle != undefined & i == 0 ?'border-right: 1px solid #ffffff;':''"
            >{{option.text}}</li>
        </ul>
    </div>
</template>

<script>
export default {
    props: ['options',
            'id',
            'customStyle'],
    data () {
        return {
            state : false
        }
    },
    methods: {
        setClick : function(option){
            if(this.state){
                this.$emit('option-click',
                {
                    data: option,
                    id: this.id   
                });
            }
        }
    }
}
</script>

<style lang="scss">
.table-view_header{
    & .more-tools{
        margin-top: -25px;
    }
}
.more-tools{
    width: 40px;
    height: 40px;
    position: absolute;
    right: 25px;
    background-image: url('../assets/more-tools.svg');
    background-position: center;
    background-repeat: no-repeat;
    background-size: 15%;
    border-radius: 5px;
    margin: 10px -10px 10px;
    transition: all 0.3s;
    overflow: hidden;

    &_list{
        transition: all 0.3s;
        max-width: 0;
        list-style: 0;
        position: absolute;
        right: 0;
        padding: 10px 30px 10px 10px;
        border-radius: 5px;
        list-style: none;
        min-height: 100%;
        z-index: 1;
        display: none;

        &-item{
            color: #ffffff;
            padding: 0 30px;
            font-size: 14px;
            text-align: center;

            &::before{
                content: '';
                display: block;
                margin: 0 auto 5px auto;
                width: 18px;
                height: 18px;
                background-position: center;
                background-repeat: no-repeat;
                background-size: contain;
            }            

            &__edit::before,
            &__editPresentation::before,
            &__add::before{
                background-image: url('../assets/edit.svg');
            }
            
            &__delet::before{
                background-image: url('../assets/delete.svg');
            }
            
            &__import::before{
                background-image: url('../assets/Import-icon.svg');
            }

            &:not(:last-child){
                padding-bottom: 10px;
            }
        }
    }

    &:hover{
        background-image: url('../assets/more-tools_active.svg');
        background-color: #5361FF;
        box-shadow: 3px 3px 14px #5361FF5A;
    }

    &__active{
        overflow: visible;
        background-color: #5361FF;

        ul{
            display: block;
            max-width: unset;
            opacity: 1;
        }
    }

    &_list {
        right: 0;
        background-color: #5361FF;
        color: #ffffff;
        opacity: 0;
    }
}
</style>