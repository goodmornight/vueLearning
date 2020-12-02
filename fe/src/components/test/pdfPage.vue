<script>
// pdfPage单页组件
import PDFDocument from '@components/test/pdfDocument'
import workerSrc from '!!file-loader!pdfjs-dist/build/pdf.worker.js'
import 'pdfjs-dist/web/pdf_viewer.css'
import '@src/design/highlighter/my.css'

const pdfjsLib = require(/* webpackChunkName: "pdfjs-dist" */ `pdfjs-dist`)
const pdfjsViewer = require(/* webpackChunkName: "pdfjs-dist" */ `pdfjs-dist/web/pdf_viewer.js`)

pdfjsLib.GlobalWorkerOptions.workerSrc = workerSrc

export default {
  components: {
    PDFDocument
  },
  props: {
    url: {
      type: String,
      default: ''
    },
  },
  data() {
    return {
      numPages: 0,
      loadingTask: null
    }
  },
  mounted(){
    this.pageViewer(this.url)
  },

  methods:{
    // pdf加载
    async pageViewer(url) {

      this.loadingTask = await pdfjsLib.getDocument(url).promise
      this.numPages = this.loadingTask.numPages
      this.$emit('numPages', this.numPages)

    },

    // 鼠标选中文本触发
    range() {
      this.$emit('range')
    },

    // textLayer加载完成触发
    storedHighLight() {
      this.$emit('storedHighLight')
    },
    
    // 传递pdf页面高度
    getPageHeight(h) {
      this.$emit('pageHeight', h)
    },
  }
}
</script>

<template>
  <div @mouseup="range">
    <PDFDocument
      v-for="n in numPages"
      :key="n"
      :loading-task="loadingTask"
      :cur-page="n"
      :num-pages="numPages"
      @isPdfCompleted="storedHighLight"
      @pageHeight="getPageHeight"
    />
  </div>
</template>
