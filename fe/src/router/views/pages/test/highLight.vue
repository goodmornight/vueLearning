<script>
// pdfViewer加载+web-highlighter高亮
import Highlighter from 'web-highlighter'
import LocalStore from '@utils/webHighLighter/local.store'
import { authComputed } from '@state/helpers'
import workerSrc from '!!file-loader!pdfjs-dist/build/pdf.worker.js'
import 'pdfjs-dist/web/pdf_viewer.css'
import '@src/design/highlighter/my.css'

const pdfjsLib = require(/* webpackChunkName: "pdfjs-dist" */ `pdfjs-dist`)
const pdfjsViewer = require(/* webpackChunkName: "pdfjs-dist" */ `pdfjs-dist/web/pdf_viewer.js`)
const log = console.log.bind(console, '[highlighter]');
pdfjsLib.GlobalWorkerOptions.workerSrc = workerSrc

export default {
  page: {
    title: 'pdfjs+web-highlighter',
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
      pdfPageView: null,
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
    ...authComputed,
    renderingState(){
      return this.pdfPageView
    },

  },
  watch:{
    'pdfPageView.renderingState':function(newVal,oldVal){
      if(newVal.renderingState===3){
        console.log('加载完成')
      }
    }
  },
  created(){

  },
  mounted(){
    let vm = this
    this.getWH()
    this.pageViewer('/1.pdf', 1)
    this.initHighLighter(this.highlighter)
    if(this.renderingState===3){
      console.log('加载完成')
    }
    // document.addEventListener('textlayerrendered', function (e) {
    //   console.log(e)
    // }, true);
    // document.addEventListener('pagesloaded', function (e) {
    //   console.log(e)
    // }, true);
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
      // vm.store = new LocalStore()

      // // retrieve data from store, and display highlights on the website
      // vm.store.getAll().forEach(
      //     // hs is the same data saved by 'store.save(sources)'
      //   ({hs}) => {
      //     console.log(hs)
      //     vm.highlighter.fromStore(hs.startMeta, hs.endMeta, hs.text, hs.id)
      //   }
      // )

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
          log('create -', sources);
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
    // pdf加载
    async pageViewer(url, curPage){
      let vm = this
      const SCALE = 1.0
      const container = vm.$refs.pageContainer
      const eventBus = new pdfjsViewer.EventBus();
      const loadingTask = await pdfjsLib.getDocument(url).promise
      const page = await loadingTask.getPage(curPage)
      const textContent = await page.getTextContent()

      let desiredHeight = vm.screenHeight
      let viewport = page.getViewport({ scale: SCALE })
      let scale = desiredHeight / viewport.height
      let scaledViewport = page.getViewport({ scale: scale })

      // Creating the page view with default parameters.
      vm.pdfPageView = new pdfjsViewer.PDFPageView({
        container: container,
        id: curPage,
        scale: scale,
        defaultViewport: scaledViewport,
        eventBus: eventBus,
        textLayerFactory: new pdfjsViewer.DefaultTextLayerFactory(),
      })
      // Associates the actual page with the view, and drawing it
      vm.pdfPageView.setPdfPage(page)
      vm.pdfPageView.draw()
      // 
      // var eventBus = new pdfjsViewer.EventBus();

      // // Loading document.
      // var loadingTask = pdfjsLib.getDocument({
      //   url: '/1.pdf'
      // });
      // loadingTask.promise.then(function (pdfDocument) {
      //   // Document loaded, retrieving the page.
      //   return pdfDocument.getPage(1).then(function (pdfPage) {
      //     // Creating the page view with default parameters.
      //     var pdfPageView = new pdfjsViewer.PDFPageView({
      //       container: container,
      //       id: 1,
      //       scale: SCALE,
      //       defaultViewport: pdfPage.getViewport({ scale: SCALE }),
      //       eventBus: eventBus,
      //       // We can enable text/annotations layers, if needed
      //       textLayerFactory: new pdfjsViewer.DefaultTextLayerFactory(),
      //       annotationLayerFactory: new pdfjsViewer.DefaultAnnotationLayerFactory(),
      //     });
      //     // Associates the actual page with the view, and drawing it
      //     pdfPageView.setPdfPage(pdfPage);
      //     return pdfPageView.draw();
      //   });
      // }).then(()=>{
      //   // vm.initHighLighter(vm.highlighter)
      //   vm.test()
      // })
    },

    // 选中文本触发事件
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
    test(){
      let vm = this
      vm.store = new LocalStore()
      vm.store.getAll().forEach(
          // hs is the same data saved by 'store.save(sources)'
        ({hs}) => {
          console.log(hs)
          vm.highlighter.fromStore(hs.startMeta, hs.endMeta, hs.text, hs.id)
        }
      )
    }
  }
}
</script>

<template>
  <div>
    <div ref="pageContainer" class="pdfViewer singlePageView" @mouseup="range">
    </div>
    <button @click='test'>历史记录</button>
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
  .highLight{
    background-color: #fc0;
  }
</style>