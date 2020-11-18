<script>
import TextHighlight from 'vue-text-highlight'
export default {
  page: {
    title: 'PDF',
  },
  components: { TextHighlight },
  data() {
    return {
      title: 'PDF',
      x: 0,
      y: 0,
      showTools: false,
      selectedText: '',
      queries: ['Drake veer', 'Drake'],
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

    },
    // 绘制高亮
    drawHighLight(selectedNodes){

      selectedNodes.forEach(node => {

        const mark = document.createElement('mark')
        // mark.setAttribute('class', 'hight-light-hover')
        // let VNode = vm.$createElement('span',node.parentNode.cloneNode(false))
        // const mark = vm.$createElement('mark', node.cloneNode(false))
        // console.log(VNode)
        // console.log(mark)
        // span.className = 'highLight'
        // i.innerHTML = selection.toString()
        // wrap.setAttribute('class', 'highlight')
        // console.log(node.cloneNode(false))
        
        mark.appendChild(node.cloneNode(false))
        // console.log(mark)
        node.parentNode.replaceChild(mark, node)
        // node.parentNode.replaceChild(`<HighLightMark :content='node.cloneNode(false)'>`, node)

      })
    },
    // createNewNode(node, tagName, class, ){

    // },
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
    hideSelectionTool(){
      this.showTools = false
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
    
    delHighLight(){
      let vm = this
      const selection = window.getSelection()
      selection.removeRange(selection.getRangeAt(0))
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
    <TextHighlight :queries="queries">
      Tropical birds scattered as Drake veered the Jeep onto an old rutted track,
    </TextHighlight>
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
  mark{
    background: #fc0;
    user-select: none
  }
  mark:hover{
    filter: brightness(95%);
  }
</style>