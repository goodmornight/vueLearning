<script>
import workerSrc from '!!file-loader!pdfjs-dist/build/pdf.worker.min.js'
// import { TextLayerBuilder, EventBus } from 'pdfjs-dist/web/pdf_viewer'
import { TextLayerBuilder, EventBus, PDFPageView, DefaultTextLayerFactory, DefaultAnnotationLayerFactory } from 'pdfjs-dist/web/pdf_viewer'
import 'pdfjs-dist/web/pdf_viewer.css'

const pdfjsLib = require(/* webpackChunkName: "pdfjs-dist" */ `pdfjs-dist`)
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
    }
  },
  computed:{
    
  },
  mounted(){
    this.getWH()
    // this.renderPdf('/1.pdf')
    this.pageViewer('/1.pdf')
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
      console.log(textContent)
      console.log(eventBus)

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
    async pageViewer(){
      let vm = this
      const CMAP_URL = "../../../../../node_modules/pdfjs-dist/cmaps/"
      const CMAP_PACKED = true

      const DEFAULT_URL = "/1.pdf"
      const PAGE_TO_VIEW = 1
      const SCALE = 1.0

      const container = vm.$refs.pageContainer
      const pdfText = vm.$refs.pdfText

      const eventBus = new EventBus();

      // Loading document.
      let loadingTask = await pdfjsLib.getDocument({
        url: DEFAULT_URL,
        cMapUrl: CMAP_URL,
        cMapPacked: CMAP_PACKED,
      }).promise
      console.log(loadingTask)
      const page = await loadingTask.getPage(PAGE_TO_VIEW)
      // const textContent = await page.getTextContent()

      let desiredHeight = vm.screenHeight
      let viewport = page.getViewport({ scale: SCALE })
      let scale = desiredHeight / viewport.height
      let scaledViewport = page.getViewport({ scale: scale })




      // Creating the page view with default parameters.
      const pdfPageView = new PDFPageView({
        container: container,
        id: PAGE_TO_VIEW,
        scale: scale,
        defaultViewport: scaledViewport,
        eventBus: eventBus,
        // We can enable text/annotations layers, if needed
        // textLayerFactory: textLayer,
        textLayerFactory: new DefaultTextLayerFactory(),
        annotationLayerFactory: new DefaultAnnotationLayerFactory(),
      })
      // Associates the actual page with the view, and drawing it
      pdfPageView.setPdfPage(page)
      pdfPageView.draw()

      // let textLayer = new TextLayerBuilder({
      //     textLayerDiv: pdfText,
      //     eventBus:eventBus,
      //     pageIndex: page.pageIndex,
      //     viewport: scaledViewport
      // })
      // textLayer.setTextContent(textContent)
      // textLayer.render()
      
      // textLayer.setTextContent(textContent)
      
      // textLayer.render()
    },
    test(){

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
    }
  }
}
</script>

<template>
  <div>
    <div ref="pageContainer" class="pdfViewer singlePageView" @mouseup="test">
      <div ref="pdfText" class="textLayer" @mouseup="range"></div>
    </div>
<!--     <div id="container" ref="pdfContainer">
      <canvas id="pdf-canvas" ref="pdfCanvas"/>
      <div id="text" ref="pdfText" class="textLayer" @mouseup="range"></div>
    </div> -->
  </div>
</template>

<style type="text/css">
  body{
    padding:0;
  }
</style>