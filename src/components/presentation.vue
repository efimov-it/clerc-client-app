<template>
    <div class="presentation">
        <div v-for="presentation in data" class="presentation-wrapper">
            <div class="presentation_date">
                {{new Date(presentation.date).toLocaleDateString()}}
            </div>
            <ul class="presentation_note">
                <li v-for="text in JSON.parse(presentation.note)" class="presentation_note-text">
                    {{text}}
                </li>
            </ul>
        </div>
    </div>
</template>

<script>
export default {
    props: ['data']
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