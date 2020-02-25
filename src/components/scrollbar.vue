<template>
    <div class="scrollbar" v-if="visible" ref="scrollbar">
        <div :class="'scrollbar_scroll' + [this.orientation == 'hor' ? ' scrollbar_scroll__horizontal' : ' scrollbar_scroll__vertical']"
             :style="[width ? 'width: '+width+';' : ''] +
                     [height ? 'height: '+height+';' : '']+
                     'top: ' + top + '%;'+
                     'left: ' + left + '%;'"
             v-on:mousedown="mousedown" v-on:mousemove="mousemove" v-on:mouseup="mouseup"
             ref="scroll"
        >
        </div>
    </div>    
</template>

<script>
export default {
    props: ['orientation'],
    data () {
        return {
            visible: false,
            width: null,
            height: null,
            top: 0,
            left: 0,
            isMoving: false,
            position: 0,
            mousePosition: 0
        }
    },
    methods: {
        mousedown: function(event){
            this.isMoving = true;

            if(this.orientation == 'hor'){
                this.mousePosition = event.clientX;
            }
            else{
                this.mousePosition = event.clientY;
            }
        },
        mousemove: function(event){
            let areaPostion;

            if(this.isMoving){
                if(this.orientation == 'hor'){
                    let maxValue = this.$refs.scrollbar.offsetWidth - this.$refs.scroll.offsetWidth;
                    if(areaPostion < 0) {
                        areaPostion = 0;
                    }
                    if(areaPostion > maxValue){
                        areaPostion = maxValue;
                    }
                    
                    if(this.position <= maxValue & this.position >= 0){
                        this.position = event.clientX - this.mousePosition;
                        areaPostion = parseInt(this.position / this.$refs.scrollbar.offsetWidth * 100);

                        this.left = areaPostion;
                    }
                }
                else{
                    let maxValue = this.$refs.scrollbar.offsetHeight - this.$refs.scroll.offsetHeight;
                    if(areaPostion < 0) {
                        areaPostion = 0;
                    }
                    if(areaPostion > maxValue){
                        areaPostion = maxValue;
                    }

                    if(this.position <= maxValue & this.position >= 0){
                        this.position = event.clientY - this.mousePosition;
                        areaPostion = parseInt(this.position / this.$refs.scrollbar.offsetHeight * 100);

                        this.top = areaPostion;
                    }
                }
            }

            this.$emit('scrolling', areaPostion);
        },
        mouseup: function(event){
            this.isMoving = false
        }
    }
}
</script>

<style lang="scss">
.scrollbar{
    background-color: #EFEFF4;
    border-radius: 7px;
    width: 100%;
    height: 100%;
    padding: 3px;
    position: relative;

    &_scroll{
        background-color: #5361FF;
        border-radius: 5px;
        cursor: pointer;
        transition: opacity 0.3s;
        position: absolute;

        &:hover{
            opacity: 0.8;
        }

        &__horizontal{
            height: 100%;
            width: 200px;
        }

        &__vertical{
            width: 100%;
            height: 200px;
        }
    }
}
</style>