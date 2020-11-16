<script>
// pdfPage单页组件
import { authComputed } from '@state/helpers'
import workerSrc from '!!file-loader!pdfjs-dist/build/pdf.worker.js'
import 'pdfjs-dist/web/pdf_viewer.css'
import '@src/design/highlighter/my.css'

const pdfjsLib = require(/* webpackChunkName: "pdfjs-dist" */ `pdfjs-dist`)
const pdfjsViewer = require(/* webpackChunkName: "pdfjs-dist" */ `pdfjs-dist/web/pdf_viewer.js`)

pdfjsLib.GlobalWorkerOptions.workerSrc = workerSrc

export default {
  components: {},
  props:{
    loadingTask:{
      type: Object,
      default: null
    },
    curPage:{
      type: Number,
      default: 0
    },
    numPages:{
      type: Number,
      default: 0
    }
  },
  data() {
    return {
      screenWidth: '',
      screenHeight: '',
      pdfPageView: null,
    }
  },
  computed:{
    ...authComputed,
    renderingState(){
      return this.pdfPageView.textLayer.renderingDone
    },
  },
  watch:{
    'pdfPageView.textLayer.renderingDone':function(newVal,oldVal){
      if(newVal && this.curPage === this.numPages){
        console.log('PDF文字层加载完成')
        this.$emit('isPdfCompleted')
      }
    },
  },
  mounted(){
    this.getWH()
    this.pageViewer(this.curPage)
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

    // pdf加载
    async pageViewer(curPage){

      const page = await this.loadingTask.getPage(curPage)
      const SCALE = 1.0
      const container = this.$refs.pageContainer
      const eventBus = new pdfjsViewer.EventBus()

      let desiredHeight = this.screenHeight
      let viewport = page.getViewport({ scale: SCALE })
      let scale = desiredHeight / viewport.height
      let scaledViewport = page.getViewport({ scale: scale })

      // Creating the page view with default parameters.
      this.pdfPageView = new pdfjsViewer.PDFPageView({
        container: container,
        id: curPage,
        scale: scale,
        defaultViewport: scaledViewport,
        eventBus: eventBus,
        textLayerFactory: new pdfjsViewer.DefaultTextLayerFactory(),
      })

      // Associates the actual page with the view, and drawing it
      this.pdfPageView.setPdfPage(page)
      this.pdfPageView.draw()

    },
  }
}
</script>

<template>
  <!-- <div ref="pageContainer" class="pdfViewer singlePageView"></div> -->
  <div ref="pageContainer" class="pdfViewer"></div>
</template>
