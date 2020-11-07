<script>
import '@src/design/highlighter/my.css'
import Highlighter from 'web-highlighter'
import LocalStore from '@utils/webHighLighter/local.store'
import { authComputed } from '@state/helpers'

export default {
  page: {
    title: 'web-highlighter',
  },
  components: {  },
  data() {
    return {
      x: 0,
      y: 0,
      isShowTools: false,
      isSelected:false,
      curID:'',
      highlighter:null,
      store:null
    }
  },
  computed:{
    ...authComputed
  },
  mounted(){

    this.initHighLighter(this.highlighter)

  },
  methods:{
    // 初始化web-highlighter插件
    initHighLighter(){
      let vm = this

      vm.highlighter = new Highlighter({
        wrapTag: 'span',
        exceptSelectors: ['pre', 'code'],
        style:{
          className:'highLight'
        }
      })
      vm.store = new LocalStore()

      // retrieve data from store, and display highlights on the website
      vm.store.getAll().forEach(
          // hs is the same data saved by 'store.save(sources)'
        ({hs}) => vm.highlighter.fromStore(hs.startMeta, hs.endMeta, hs.text, hs.id)
      )

      vm.highlighter
      .on(Highlighter.event.HOVER, ({id}) => {

          const selection = window.getSelection()
          vm.isShowTools = true
          vm.isSelected = true
          vm.curID = id
          // 鼠标放置高亮文本处，改变样式
          vm.highlighter.addClass('highlight-wrap-hover', id)
          
          if(selection.isCollapsed){
            // 未选中文本
            console.log(window.event)
            console.log(window.event.target)
            console.log(window.event.target.getBoundingClientRect())
            vm.getToolLocation(window.event.target)

          }else{
            // 选中文本
            const range = selection.getRangeAt(0)
            vm.isSelected = false
            vm.getToolLocation(range)

          }

      })
      .on(Highlighter.event.HOVER_OUT, ({id}) => {
          // remove the hover effect when leaving
          vm.curID = id
          vm.highlighter.removeClass('highlight-wrap-hover', id);
      })
      .on(Highlighter.event.CREATE, ({sources}) => {
          vm.curID = sources.id
          sources = sources.map(hs => ({hs}))
          // save to backend
          vm.store.save(sources)
          vm.isShowTools = false
          vm.isSelected = false
      })
      .on(Highlighter.event.REMOVE, ({ids}) => {
          ids.forEach(id => {
            vm.curID = id
            vm.store.remove(id)
          })
          vm.isShowTools = false
          vm.isSelected = false
      })
    },

    // 计算按钮位置
    getToolLocation(node){
      const { x, y, width } = node.getBoundingClientRect()
      this.x = x + (width / 2)
      this.y = y + window.scrollY - 10
    },
    
    // 选中文本触发事件
    range(){
      let vm = this
      const selection = window.getSelection()
      // 判断选区起始点是否在同一个位置
      if (selection.isCollapsed) {
        vm.isShowTools = false
        console.debug('no text selected')
        return null;
      }
      vm.selectionTool(selection)

      console.log(selection)
      console.log(selection.toString())
      console.log(selection.getRangeAt(0))
    },

    // 选中文本弹出按钮
    selectionTool(selection){
      let vm = this
      vm.isSelected = false

      if (selection.isCollapsed) {
        vm.isShowTools = false
        return
      }

      const range = selection.getRangeAt(0)
      vm.getToolLocation(range)
      this.isShowTools = true
      
    },

    // 高亮文本
    highLight(){
      let vm = this
      const selection = window.getSelection()
      const range = selection.getRangeAt(0)
      // 使用web-highlighter高亮文本
      vm.highlighter.fromRange(range)

      vm.isShowTools = false
      vm.isSelected = false
      selection.removeRange(range)
    },
    // 删除高亮
    delHighLight(){
      let vm = this
      vm.highlighter.remove(vm.curID)
      vm.isShowTools = false
    },
  }
}
</script>

<template>
  <div ref="container" class="container" @mouseup="range">
    <span>Tropical birds scattered as Drake veered the Jeep onto an old rutted track,</span>
    <span>snapping branches and tearing away vines, plowing through the rain forest with killers in pursuit,</span>
    <span>bullets flying, a gorgeous but pouty girl in the passenger’s seat, and a bitch of a headache.</span>
    <span>With only one of his arms on the wheel, the Jeep slewed to the left, and the pouty girl screamed as</span>
    <span>he forced the vehicle back onto the trail just before they would have crashed into a felled tree.</span>
    <div
      v-show="isShowTools"
      ref="tip"
      class="tools"
      :style="{
        left: `${x}px`,
        top: `${y}px`,
      }"
      @mousedown.prevent=""
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
  </div>
</template>

<style type="text/css">
  body{
    padding:0;
    text-align: middle;
  }
  .container{
    width: 80%;
    font-size: 16px;
    /*line-height: 32px;*/
    margin: 10% auto;
  }
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
  .highLight{
    background-color: #fc0;
  }

</style>