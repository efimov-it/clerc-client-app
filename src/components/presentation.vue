<template>
    <div class="presentation">
        <div v-for="(presentation, i) in data" :key="i" class="presentation-wrapper">
            <div class="presentation_date">
                {{(new Date(presentation.date.replace(/"/g, ''))).toLocaleDateString()}}
            </div>
            <ul class="presentation_note">
                <li v-for="(line, index) in presentation.note.split('<br />')" :key="index">
                    {{line}}
                </li>
            </ul>
        </div>
    </div>
</template>

<script>
export default {
    props: ['data'],
    methods: {
        updateJSON () {
            this._props.data.forEach(pres => {
                pres.note = pres.note.replace(/["|"]|"/g, '').replace(/","/, '<br />');
                pres.note = pres.note.replace(/\\r\\n|\\n/g, '<br />');
                pres.date = pres.date.replace('"', '');
            });
        }
    },
    mounted () {
        this.updateJSON();
    },
    updated () {
        this.updateJSON();
    }
}
</script>

<style lang="scss">
    .presentation-wrapper {
        display: grid;
        grid-template-columns: 2fr 3fr;
        grid-gap: 15px;
        padding: 10px;
        border: 1px solid #5361ff;
        border-bottom: none;
    }
    .presentation-wrapper:first-child {
        border-radius: 7px 7px 0px 0px;
    }
    .presentation-wrapper:last-child {
        border-bottom: 1px solid #5361ff;
        border-radius: 0px 0px 7px 7px;
    }
    .presentation-wrapper:first-child:last-child {
        border-radius: 7px;
    }
    .presentation_note {
        list-style: none;
        
        &-text:not(:last-child) {
            margin-bottom: 10px;
        }
    }
</style>