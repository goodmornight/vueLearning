<script>
import workerSrc from '!!file-loader!pdfjs-dist/build/pdf.worker.min.js'
import { TextLayerBuilder, EventBus } from 'pdfjs-dist/web/pdf_viewer'
import 'pdfjs-dist/web/pdf_viewer.css'
import Highlighter from '@utils/highlighter/highlighter'
const pdfjsLib = require(/* webpackChunkName: "pdfjs-dist" */ `pdfjs-dist`)
pdfjsLib.GlobalWorkerOptions.workerSrc = workerSrc
/**
 * PDF component
 */
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
    this.getWH()
    this.renderPdf('/1.pdf')
    window.addEventListener('mouseup', this.onMouseup)
    // window.addEventListener('keyup',this.range)
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
    // 加载pdf
    async renderPdf(pdfUrl){
      let vm = this
      // let pageDiv = document.getElementById('container')
      let pageDiv = vm.$refs.pdfContainer

      const pdf = await pdfjsLib.getDocument(pdfUrl).promise
      const page = await pdf.getPage(1)

      const canvas = vm.$refs.pdfCanvas
      const context = canvas.getContext('2d')

      let desiredHeight = vm.screenHeight
      let viewport = page.getViewport({ scale: 1 })

      let scale = desiredHeight / viewport.height;
      let scaledViewport = page.getViewport({ scale: scale })
      
      canvas.width = scaledViewport.width
      canvas.height = scaledViewport.height

      const renderContext = {
        canvasContext: context,
        viewport: scaledViewport,
      }

      const renderPage = await page.render(renderContext).promise
      const textContent = await page.getTextContent()  
      const textLayerDiv = vm.$refs.pdfText
      const eventBus = new EventBus()

      // 创建新的TextLayerBuilder实例
      let textLayer = new TextLayerBuilder({
          textLayerDiv: textLayerDiv,
          eventBus:eventBus,
          pageIndex: page.pageIndex,
          viewport: scaledViewport
      })
      
      textLayer.setTextContent(textContent)
      textLayer.render()
    },
    range(){

      const selection = window.getSelection()
      // 判断选区起始点是否在同一个位置
      if (selection.isCollapsed) {
        console.debug('no text selected')
        return null;
      }
      console.log(selection)
      console.log(selection.toString())
      console.log(selection.getRangeAt(0))

      const range = selection.getRangeAt(0)
      const rangeList = range.getClientRects()
      console.log(range.getClientRects())
      const start = {
        startContainer: range.startContainer,
        startOffset: range.startOffset
      }
      const end = {
        endContainer: range.endContainer,
        endOffset: range.endOffset
      }
      
      // start.startContainer.splitText(start.startOffset)
      // return selection.getRangeAt(0);

    },
    onMouseup(){
      const selection = window.getSelection()
      const range = selection.getRangeAt(0)
      // const startNode = range.startContainer.parentNode
      // const endNode = range.endContainer.parentNode

      console.log(selection.getRangeAt(0))
      // console.log(startNode)
      // console.log(endNode)

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
      console.log('highLight')
      const selection = window.getSelection()
      const range = selection.getRangeAt(0)
      console.log(range)
      Highlighter.fromRange(range)
    }
  },
  beforeDestroy () {
    window.removeEventListener('mouseup', this.onMouseup)
  },
}
</script>

<template>
  <div>
    <div id="container" ref="pdfContainer">
      <canvas id="pdf-canvas" ref="pdfCanvas"/>
      <div id="text" ref="pdfText" class="textLayer" @mouseup="onMouseup">
        
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
    </div>
  </div>

</template>

<style type="text/css">
  body{
    padding:0;
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
/*.item + .item
  {margin-left: 10px}*/
</style>