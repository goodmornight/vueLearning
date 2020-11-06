<script>
// import WebHighLighter from '@utils/webHighLighter/highlighter'
import '@src/design/highlighter/my.css'
import Highlighter from 'web-highlighter'
import LocalStore from '@utils/webHighLighter/local.store'

const highlighter = new Highlighter({
    wrapTag: 'span',
    exceptSelectors: ['.my-remove-tip', 'pre', 'code'],
    style:{
      className:'highLight'
    }
})
const store = new LocalStore()

// retrieve data from store, and display highlights on the website
store.getAll().forEach(
    // hs is the same data saved by 'store.save(sources)'
    ({hs}) => highlighter.fromStore(hs.startMeta, hs.endMeta, hs.text, hs.id)
);

export default {
  page: {
    title: 'PDF',
  },
  components: {  },
  data() {
    return {
      title: 'PDF',
      x: 0,
      y: 0,
      showTools: false,
      isSelected:false,
      selectedText: '',
      curID:''
    }
  },
  computed:{
    highlightableEl () {
      return this.$refs.tip
    }
  },
  mounted(){
    let vm = this
    highlighter
    .on(Highlighter.event.HOVER, ({id}) => {

        const selection = window.getSelection()
        console.log(selection)
        vm.showTools = true
        vm.isSelected = true
        vm.curID = id
        // display different bg color when hover
        highlighter.addClass('highlight-wrap-hover', id)

        if(!selection.isCollapsed){
          const range = selection.getRangeAt(0)
          vm.isSelected = false
          const { x, y, width } = range.getBoundingClientRect()
          this.x = x + (width / 2)
          this.y = y + window.scrollY - 10
          this.showTools = true
        }

    })
    .on(Highlighter.event.HOVER_OUT, ({id}) => {
        // vm.showTools = false
        // vm.isSelected = false
        // remove the hover effect when leaving
        vm.curID = id
        highlighter.removeClass('highlight-wrap-hover', id);
    })
    .on(Highlighter.event.CREATE, ({sources}) => {
        vm.curID = sources.id
        sources = sources.map(hs => ({hs}))
        // save to backend
        store.save(sources)
        vm.showTools = false
        vm.isSelected = false
    })
    .on(Highlighter.event.REMOVE, ({ids}) => {
        ids.forEach(id => {
          vm.curID = id
          store.remove(id)
        })
        vm.showTools = false
        vm.isSelected = false
    })

  },
  methods:{
    
    range(){
      let vm = this
      const selection = window.getSelection()
      // 判断选区起始点是否在同一个位置
      if (selection.isCollapsed) {
        console.debug('no text selected')
        return null;
      }
      vm.selectionTool(selection)

      console.log(selection)
      console.log(selection.toString())
      console.log(selection.getRangeAt(0))
    },

    getSelectionRange(root, range){

      const {
        startContainer,
        endContainer,
        startOffset,
        endOffset
      } = range

      let selectedNodes = []
      
      // 选中区域在一个节点内
      if(startContainer === endContainer){

        startContainer.splitText(startOffset)
        let passedNode = startContainer.nextSibling
        passedNode.splitText(endOffset - startOffset)

        selectedNodes.push(passedNode)
        return selectedNodes

      }

      // 选中区域包含多个节点
      let curNode = root
      let withinSelectedRange = false
      let treeWalker = document.createTreeWalker(curNode, NodeFilter.SHOW_TEXT, null, false)

      while(curNode != null){
        if(curNode.nodeType === 3){
          
          if(curNode === startContainer){

            curNode.splitText(startOffset)
            const node = curNode.nextSibling
            selectedNodes.push(node)

            curNode = treeWalker.nextNode()

            withinSelectedRange = true

          }else if(curNode === endContainer){

            const node = curNode
            node.splitText(endOffset)
            selectedNodes.push(node)

            withinSelectedRange = false

            return selectedNodes

          }else if(withinSelectedRange){

            selectedNodes.push(curNode)

          }
        }
        
        curNode = treeWalker.nextNode()
        console.log(curNode)
      }
    },

    selectionTool(selection){
      // const selection = window.getSelection()
      // const range = selection.getRangeAt(0)
      this.isSelected = false
      if (selection.isCollapsed) {
        this.showTools = false
        return
      }
      const range = selection.getRangeAt(0)
      const { x, y, width } = range.getBoundingClientRect()
      
      this.x = x + (width / 2)
      this.y = y + window.scrollY - 10
      this.showTools = true
      this.selectedText = selection.toString()
      
    },
    hideSelectionTool(){
      this.showTools = false
    },
    highLight(){
      let vm = this
      const selection = window.getSelection()
      const range = selection.getRangeAt(0)
      highlighter.fromRange(range)
      // console.log(range.getClientRects())
      
      // const selectedNodes = vm.getSelectionRange(vm.$refs.container, range)
      // console.log(selectedNodes)

      // vm.drawHighLight(selectedNodes)
      vm.showTools = false
      vm.isSelected = false
      selection.removeRange(range)
    },
    
    delHighLight(){
      let vm = this
      highlighter.remove(vm.curID)
      const selection = window.getSelection()
      const range = selection.getRangeAt(0)
      selection.removeRange(range)
      vm.showTools = false
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
      v-show="showTools"
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