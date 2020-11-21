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
    curPage: {
      type: Number,
      default: 0
    },
    numPages: {
      type: Number,
      default: 0
    }
  },
  // data() {
  //   return {}
  // },
  // mounted(){
  //   this.pageViewer(this.url)
  // },

  methods:{
    // 通过input跳转页面
    scrollToPage(){
      this.$emit('scrollToPage')
    },
    // 回到顶部
    scrollToTop(){
      this.$emit('scrollToTop', 0)
    }
  }
}
</script>

<template>
  <div class="pdf-footer">
    <div class="to-page">
      <div style="display: inline-block;">
        <input
          v-model.number="curPage"
          type="number"
          class="form-control"
          :min="1"
          :max="numPages"
          @change="scrollToPage"
        />
      </div>
      <div style="display: inline-block;">
        <span>/ {{ numPages }}</span>
      </div>
    </div>
    <div class="to-top" @click="scrollToTop">
      <i class="uil uil-top-arrow-to-top"></i>
    </div>
  </div>
</template>
<style type="text/css">
  .pdf-footer{
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    height: 100px;
    width: 100%;
    /*background-color: orange;*/
    /*text-align: center;*/
  }
  .to-page{
    position: absolute;
    bottom: 25%;
    left: 50%;
    right: 0;
    display: inline-block;
  }
  .to-top{
    position: absolute;
    bottom: 65%;
    right: 10%;
    display: inline-block;
    cursor: pointer;
    height: 60px;
    width: 60px;
    border-radius: 50%;
    background-color: #5369f8;
    color: #fff;
    font-size: 23px;
    text-align: center;
    line-height: 60px;
    box-shadow: 0 0.05rem 0.01rem rgba(75, 75, 90, 0.075);
  }
</style>