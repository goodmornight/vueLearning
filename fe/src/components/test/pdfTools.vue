<script>
export default {
  props:{
    x:{
      type: Number,
      default: 0
    },
    y:{
      type: Number,
      default: 0
    },
    isSelected:{
      type: Boolean,
      default: false
    },
  },
  data(){
  	return{
  		// x: 0,
	   //  y: 0,
	   //  showTools: false,
	   //  selectedText: ''
  	}
  },
  methods:{
    highLight(){
      this.$emit('highLight')
    },
    delHighLight(){
      this.$emit('delHighLight')
    }
  }
}
</script>
<template>
	<div
    ref="tip"
    class="tools"
    :style="{
      left: `${x}px`,
      top: `${y}px`,
    }"
  >
    <span
      v-show="!isSelected"
      class="item"
      @click="highLight"
    >
      <i class="uil uil-pen"></i>
    </span>
    <span
      v-show="isSelected"
      class="item"
      @click="delHighLight"
    >
      <i class="uil uil-trash"></i>
    </span>
  </div>
</template>
<style type="text/css">
	.tools{
    height: 30px;
    padding: 5px 10px;
    background: #333;
    border-radius: 3px;
    position: absolute;
    top: 0;
    left: 0;
    transform: translate(-50%, -100%);
    transition: 0.2s all;
    display: flex;
    justify-content: center;
    align-items: center;
  }

  .tools:after{
    content: '';
    position: absolute;
    left: 50%;
    bottom: -5px;
    transform: translateX(-50%);
    width: 0;
    height: 0;
    border-left: 6px solid transparent;
    border-right: 6px solid transparent;
    border-top: 6px solid #333;
  }
  .item{
    color: #FFF;
    cursor: pointer;
    display: inline-block;
    font-size: 18px;
  }

  .item path{
    fill: #FFF;
  }

  .item:hover path{
    fill: #1199ff;
  }

  .item:hover{
    color: #1199ff;
  }
</style>