<script>
// pdfViewer加载+自定义高亮
import workerSrc from '!!file-loader!pdfjs-dist/build/pdf.worker.js'
import 'pdfjs-dist/web/pdf_viewer.css'

const pdfjsLib = require(/* webpackChunkName: "pdfjs-dist" */ `pdfjs-dist`)
const pdfjsViewer = require(/* webpackChunkName: "pdfjs-dist" */ `pdfjs-dist/web/pdf_viewer.js`)
pdfjsLib.GlobalWorkerOptions.workerSrc = workerSrc

export default {
  page: {
    title: 'PDF',
  },
  components: {  },
  data() {
    return {
      title: 'PDF',
      src: '/1.pdf',
      screenWidth: '',
      screenHeight: '',
      numPages: undefined,
      currentPage: 1,
      pageCount: 0,
      scale:1.5,
      x: 0,
      y: 0,
      showTools: false
    }
  },
  computed:{
    highlightableEl () {
      return this.$refs.tip
    }
  },
  mounted(){
    this.getWH()
    // this.renderPdf('/1.pdf')
    this.pageViewer('/1.pdf', 1)
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
    async pageViewer(url, curPage){
      let vm = this
      // const CMAP_URL = "../../../../../node_modules/pdfjs-dist/cmaps/"
      // const CMAP_PACKED = true

      // const DEFAULT_URL = url
      // const PAGE_TO_VIEW = page
      const SCALE = 1.0

      const container = vm.$refs.pageContainer
      // const pdfText = vm.$refs.pdfText

      const eventBus = new pdfjsViewer.EventBus();

      // Loading document.
      // let loadingTask = await pdfjsLib.getDocument({
      //   url: DEFAULT_URL,
      //   // cMapUrl: CMAP_URL,
      //   // cMapPacked: CMAP_PACKED,
      // }).promise
      const loadingTask = await pdfjsLib.getDocument(url).promise

      const page = await loadingTask.getPage(curPage)
      const textContent = await page.getTextContent()
      console.log(textContent)
      let desiredHeight = vm.screenHeight
      let viewport = page.getViewport({ scale: SCALE })
      let scale = desiredHeight / viewport.height
      let scaledViewport = page.getViewport({ scale: scale })

      // Creating the page view with default parameters.
      const pdfPageView = new pdfjsViewer.PDFPageView({
        container: container,
        id: curPage,
        scale: scale,
        defaultViewport: scaledViewport,
        eventBus: eventBus,
        // We can enable text/annotations layers, if needed
        // textLayerFactory: textLayer,
        textLayerFactory: new pdfjsViewer.DefaultTextLayerFactory(),
        // annotationLayerFactory: new pdfjsViewer.DefaultAnnotationLayerFactory(),
      })
      // Associates the actual page with the view, and drawing it
      pdfPageView.setPdfPage(page)
      pdfPageView.draw()
    },
    // range(){
    //   const selection = window.getSelection()
    //   // 判断选区起始点是否在同一个位置
    //   if (selection.isCollapsed) {
    //     console.debug('no text selected')
    //     return null;
    //   }
    //   console.log(selection)
    //   console.log(selection.toString())
    //   console.log(selection.getRangeAt(0))

    //   const range = selection.getRangeAt(0)
    //   const rangeList = range.getClientRects()
    //   console.log(range.getClientRects())

    //   const start = {
    //     startContainer: range.startContainer,
    //     startOffset: range.startOffset
    //   }
    //   const end = {
    //     endContainer: range.endContainer,
    //     endOffset: range.endOffset
    //   }

    //   const RANGE_COUNT = selection.rangeCount
    //   const startNode = range.startContainer
    //   const endNode = range.endContainer
    //   let selectedNodes = []
    //   let curNode = startNode

    //   // if(RANGE_COUNT === 1){
    //   //   if(curNode.nodeType === 3){
    //   //     curNode.splitText(start.startOffset)
    //   //   }
    //   // }

    //   // for(let i = 0;i < RANGE_COUNT; i++){
    //   //   if(curNode === startNode){
    //   //     if(curNode.nodeType === 3){
    //   //       curNode.splitText(start.startOffset)
    //   //       const node = curNode.nextSibling
    //   //       selectedNodes.push(node)
    //   //     }
    //   //   }

    //   //   if(curNode === endNode){
    //   //     if(curNode.nodeType === 3){
    //   //       const node = curNode
    //   //       node.splitText(end.endOffset)
    //   //       selectedNodes.push(node)
    //   //     }
    //   //   }
    //   //   curNode = curNode.nextSibling
    //   // }
    //   // console.log(selectedNodes)
    //   // 首尾节点拆分
    //   // const startNode = start.startContainer.splitText(start.startOffset)
    //   // console.log(startNode)
    //   // 创建一个<i>的标签
    //   const i = document.createElement('i')
    //   i.className = 'highLight'
    //   i.innerHTML = selection.toString()
    //   console.log(i)
    //   // start.startContainer.parentNode.insertBefore(i, startNode)
    // },
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
    // 绘制高亮
    drawHighLight(selectedNodes){

      selectedNodes.forEach(node => {

        const mark = document.createElement('mark')
        
        mark.appendChild(node.cloneNode(false))
        node.parentNode.replaceChild(mark, node)

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
      
      const selectedNodes = vm.getSelectionRange(vm.$refs.pageContainer, range)
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
  }
}
</script>

<template>
  <div>
    <div ref="pageContainer" class="pdfViewer singlePageView" @mouseup="range">
    </div>
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
        class="item"
        @click="highLight"
      >
        <i class="uil uil-pen"></i>
      </span>
      <span
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
    color: transparent;
    background: #fc0;
    user-select: none;
    cursor: pointer;
  }
  mark:hover{
    filter: brightness(95%);
  }
</style>