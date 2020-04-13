<template>
    <div class="header_buttons">
        <button v-if="this.isAdmin" v-on:click="admin()" class="header_button header_button__admin" title="Пользователи"></button>
        <span v-if="this.isAdmin" class="header_separator"></span>
        <button v-on:click="logOut()" class="header_button header_button__logout" title="Выйти"></button>
    </div>
</template>

<script>

export default {
    props : ['isAdmin'],
    data () {
        return {
            
        }
    },
    methods: {
        admin: function(){
            this.$emit('buttonPressed', 'admin');
        },
        logOut: function(){
            this.$emit('buttonPressed', 'logOut');
        }
    }
}
</script>

<style lang="scss">
.header{
    &_buttons{
        display: flex;
        justify-content: flex-end;
        align-items: center;
        margin: 0 60px;
    }

    &_separator{
        width: 1px;
        height: 17px;
        background-color: #2E2E2E;
        margin: 0 20px;
        opacity: 0.3;
    }

    &_button{
        border: none;
        background-color: transparent;
        width: 17px;
        height: 17px;
        background-position: center;
        background-repeat: no-repeat;
        background-size: contain;

        &__logout{
            background-image: url('../assets/logout.svg');
        }
        
        &__admin{
            background-image: url('../assets/user.svg');
        }
    }
}
</style>