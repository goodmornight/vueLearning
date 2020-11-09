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
    title: 'canvas + textlayer + web-highlighter',
  },
  components: {  },
  data() {
    return {
      title: 'PDF',
      src: '/1.pdf',
      screenWidth: '',
      screenHeight: '',
      textLayer:null,
      x: 0,
      y: 0,
      isShowTools: false,
      isSelected:false,
      curID:'',
      highlighter:null,
      store:null,
    }
  },
  computed:{
    ...authComputed
  },
  mounted(){
    // let vm = this
    this.getWH()
    this.renderPdf('/1.pdf')
    this.initHighLighter(this.highlighter)
    this.storedHighLight()
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
      const eventBus = new pdfjsViewer.EventBus()
      console.log(textContent)
      console.log(eventBus)

      // 创建新的TextLayerBuilder实例
      vm.textLayer = new pdfjsViewer.TextLayerBuilder({
        textLayerDiv: textLayerDiv,
        eventBus:eventBus,
        pageIndex: page.pageIndex,
        viewport: scaledViewport
      })
      
      vm.textLayer.setTextContent(textContent)
      
      vm.textLayer.render()
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

    // 选中文本触发事件
    range(){
      const selection = window.getSelection()
      // 判断选区起始点是否在同一个位置
      if (selection.isCollapsed) {
        console.debug('no text selected')
        return null
      }

      this.selectionTool(selection)

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

    storedHighLight(){
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
    <div id="container" ref="pdfContainer">
      <canvas id="pdf-canvas" ref="pdfCanvas"/>
      <div id="text" ref="pdfText" class="textLayer" @mouseup="range"></div>
    </div>
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