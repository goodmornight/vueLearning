<script>
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
      selectedText: ''
    }
  },
  computed:{
    highlightableEl () {
      return this.$refs.tip
    }
  },
  mounted(){
    
  },
  methods:{
    // 获取浏览器内部的宽高
    getWH(){
      let vm = this
      vm.screenWidth = window.innerWidth
      vm.screenHeight = window.innerHeight
      window.onresize = () => {
        return (() => {
          vm.screenWidth = window.innerWidth
          vm.screenHeight = window.innerHeight
        })()
      }
    },
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

      // const range = selection.getRangeAt(0)
      // console.log(range.getClientRects())
      
      // const selectedNodes = vm.getSelectionRange(vm.$refs.container, range)
      // console.log(selectedNodes)

      // vm.drawHighLight(selectedNodes)
 
      // const start = {
      //   startContainer: range.startContainer,
      //   startOffset: range.startOffset
      // }
      // const end = {
      //   endContainer: range.endContainer,
      //   endOffset: range.endOffset
      // }
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

      // vm.DFS(vm.$refs.container,function (curNode,deep) {

      //   if(curNode.nodeType === 3){

      //     if(curNode === startContainer){

      //       curNode.splitText(startOffset)
      //       const node = curNode.nextSibling
      //       selectedNodes.push(node)
      //       withinSelectedRange = true

      //     }else if(curNode === endContainer){

      //       const node = curNode
      //       node.splitText(endOffset)
      //       selectedNodes.push(node)
      //       withinSelectedRange = false
      //       console.log(selectedNodes)
      //       return selectedNodes

      //     }else if(withinSelectedRange){

      //       selectedNodes.push(curNode)

      //     }
      //   }
      //   console.log(selectedNodes)
      // })
    },
    drawHighLight(selectedNodes){
      selectedNodes.forEach(node => {

        const span = document.createElement('span')
        span.className = 'highLight'
        // i.innerHTML = selection.toString()
        // wrap.setAttribute('class', 'highlight')
        // console.log(node.cloneNode(false))
        span.appendChild(node.cloneNode(false))
        node.parentNode.replaceChild(span, node)

      })
    },
    selectionTool(selection){
      // const selection = window.getSelection()
      // const range = selection.getRangeAt(0)

      if (selection.isCollapsed) {
        this.showTools = false
        return
      }

      const { x, y, width } = selection.getRangeAt(0).getBoundingClientRect()
      
      this.x = x + (width / 2)
      this.y = y + window.scrollY - 10
      this.showTools = true
      this.selectedText = selection.toString() 
    },

    highLight(){
      let vm = this
      const selection = window.getSelection()
      const range = selection.getRangeAt(0)
      console.log(range.getClientRects())
      
      const selectedNodes = vm.getSelectionRange(vm.$refs.container, range)
      console.log(selectedNodes)

      vm.drawHighLight(selectedNodes)
      vm.showTools = false
    },
    
    DFS(node, cb) {
      let vm = this
      let deep = 1
      vm.DFSdom(node, deep, cb)
    },

    DFSdom(node, deep, cb) {
      let vm = this
      if(!node) return

      cb(node,deep)

      if(!node.childNodes.length) return

      deep++
      Array.from(node.childNodes).forEach(item => vm.DFSdom(item,deep,cb))
    },

    BFS(node,cb) {
      if(!node)
        return;

      var queue = [{
        node: node,
        depth: 1
      }]

      while(queue.length) {
        var current = queue.shift();

        cb(current)

        current.node.childNodes.length && Array.from(current.node.childNodes).forEach(item => {
          queue.push({
            node: item,
            depth: current.depth + 1
          })
        })
      }
    }
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
        top: `${y}px`
      }"
      @mousedown.prevent=""
    >
      <span
        class="item"
        @click="highLight"
      >
        <svg style="width:24px;height:24px" viewBox="0 0 24 24">
          <path fill="#000000" d="M18.5,1.15C17.97,1.15 17.46,1.34 17.07,1.73L11.26,7.55L16.91,13.2L22.73,7.39C23.5,6.61 23.5,5.35 22.73,4.56L19.89,1.73C19.5,1.34 19,1.15 18.5,1.15M10.3,8.5L4.34,14.46C3.56,15.24 3.56,16.5 4.36,17.31C3.14,18.54 1.9,19.77 0.67,21H6.33L7.19,20.14C7.97,20.9 9.22,20.89 10,20.12L15.95,14.16" />
        </svg>
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
  .highLight{
    background-color: #ff8
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
  .highlight-wrap-hover{
    color: #ff9;
  }
</style>