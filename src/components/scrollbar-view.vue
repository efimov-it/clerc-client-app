<template>
    <div class="scrollbar-wrapper">
        <div ref="area" class="scrollbar-area">
            <div ref="drag" class="scrollbar-area_dragable">
                <slot></slot>
            </div>
        </div>
        <scrollbar  ref="ver" orientation="ver" />
        <scrollbar  ref="hor" orientation="hor" />
    </div>    
</template>

<script>
import Vue from 'vue'

import Scrollbar from './scrollbar'
Vue.component('scrollbar', Scrollbar);

export default {
    data(){
        return {

        }
    },
    mounted () {
        let drag = this.$refs.drag;
        let area = this.$refs.area;

        let hor = this.$refs.hor;
        let ver = this.$refs.ver;

        if(drag.offsetWidth > area.offsetWidth){
            hor.visible = true;
            hor.width = parseInt(area.offsetWidth / drag.offsetWidth * 100) + '%';
            console.log(hor.width);
        }
        else{
            hor.visible = false;
        }

        if(drag.offsetHeight > area.offsetHeight){
            ver.visible = true;
            ver.height = parseInt(area.offsetHeight / drag.offsetHeight * 100) + '%';
        }
        else{
            ver.visible = false;
        }
    }
}
</script>

<style lang="scss">
.scrollbar-wrapper{
    width: 100%;
    height: 100%;
    display: grid;
    grid-template-columns: 1fr 10px;
    grid-template-rows: 1fr 10px;
}
.scrollbar-area{
    width: 100%;
    height: 100%;
    padding: 10px;
    overflow: hidden;
    position: relative;

    &_dragable{
        position: absolute;
        min-width: calc(200% - 20px);
        min-height: calc(200% - 20px);
    }
}
</style>