<template>
    <label class="form-input">
        <span class="form-input_text">{{text}}</span>
        <input class="form-input_object" :placeholder="placeholder" :name="name" :type="type" v-model="value"/>
    </label>
</template>

<script>
export default {
    props: ['text',
            'placeholder',
            'name',
            'type',
            'width'],
    data(){
        return {
            value: ''
        }
    }
}
</script>

<style lang="scss">
.form-input{
    display: block;
    text-align: left;

    &_text{
        font-size: 16px;
        color: #2E2E2E;
        font-weight: bold;
        display: block;
    }

    &_object{
        padding: 10px 0;
        border: none;
        border-bottom: 1px solid #DCDCE8;
        color: #2E2E2E;
        min-width: 290px;
    }
    &_object::placeholder{
        color: #DCDCE8;
        transition: opacity 0.3s;
    }
    &_object:focus::placeholder{
        opacity: 0;
    }
}
</style>