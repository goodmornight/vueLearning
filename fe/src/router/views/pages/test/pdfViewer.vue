<script>
// pdfViewer加载+web-highlighter高亮
import PDFPage from '@components/test/pdfPage'
import PDFSideBar from '@components/test/pdfSideBar'
// import PDFTools from '@components/test/pdfTools'
import Highlighter from 'web-highlighter'
import LocalStore from '@utils/webHighLighter/local.store'
import workerSrc from '!!file-loader!pdfjs-dist/build/pdf.worker.js'
import 'pdfjs-dist/web/pdf_viewer.css'
import '@src/design/highlighter/my.css'

const pdfjsLib = require(/* webpackChunkName: "pdfjs-dist" */ `pdfjs-dist`)
const log = console.log.bind(console, '[highlighter]')

pdfjsLib.GlobalWorkerOptions.workerSrc = workerSrc

export default {
  page: {
    title: 'pdf整篇显示',
  },
  components: {
    PDFPage,
    // PDFTools,
    PDFSideBar
  },
  data() {
    return {
      url:'/1.pdf',
      numPages: 0,
      loadingTask: null,
      x: 0,
      y: 0,
      isShowTools: false,
      isSelected:false,
      curID:'',
      highlighter:null,
      store:null
    }
  },
  mounted(){
    // this.getWH()
    this.pageViewer(this.url)
    this.initHighLighter(this.highlighter)
  },

  methods:{
    // 初始化web-highlighter插件
    initHighLighter(){
      let vm = this

      vm.highlighter = new Highlighter({
        wrapTag: 'span',
        exceptSelectors: ['pre', 'code', 'h6'],
        style:{
          className:'highLight'
        }
      })

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
    async pageViewer(url){

      this.loadingTask = await pdfjsLib.getDocument(url).promise
      this.numPages = this.loadingTask.numPages

    },

    // 选中文本触发事件
    range(){

      const selection = window.getSelection()
      // 判断选区起始点是否在同一个位置
      if (selection.isCollapsed) {

        this.isShowTools = false
        console.debug('no text selected')
        return

      }
      this.selectionTool(selection)

    },

    // 选中文本弹出按钮
    selectionTool(selection){

      this.isSelected = false

      if (selection.isCollapsed) {
        this.isShowTools = false
        return
      }

      const range = selection.getRangeAt(0)
      this.getToolLocation(range)
      this.isShowTools = true
      
    },

    // 高亮文本
    highLight(){
      console.log('高亮')
      const selection = window.getSelection()
      const range = selection.getRangeAt(0)
      this.highlighter.setOption({
        style:{
          className:'test'
        }
      })
      // 使用web-highlighter高亮文本
      this.highlighter.fromRange(range)


      this.isShowTools = false
      this.isSelected = false
      selection.removeRange(range)

    },
    // 删除高亮
    delHighLight(){
      console.log('删除高亮')
      this.highlighter.remove(this.curID)
      this.isShowTools = false

    },
    // 已保存的高亮显示
    storedHighLight(){

      console.log('显示已保存高亮')
      let vm = this
      vm.store = new LocalStore()
      vm.store.getAll().forEach(
          // hs is the same data saved by 'store.save(sources)'
        ({hs}) => {
          console.log(hs)
          vm.highlighter.fromStore(hs.startMeta, hs.endMeta, hs.text, hs.id)
        }
      )

    },
    toggleRightSidebar() {
      document.body.classList.toggle('right-bar-enabled')
    },
  }
}
</script>

<template>
  <div>
    <!-- <div ref="pageContainer" class="pdfViewer singlePageView" @mouseup="range">
    </div> -->
    <div @mouseup="range">
      <PDFPage
      v-for="n in numPages"
      :key="n"
      :loading-task="loadingTask"
      :cur-page="n"
      :num-pages="numPages"
      @isPdfCompleted="storedHighLight"
      />
    </div>
    <!-- <PDFTools
      v-show="isShowTools"
      :x="x"
      :y="y"
      :is-selected="isSelected"
      @highLight="highLight"
      @delHighLight="delHighLight"
    /> -->
    
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
      <span v-show="!isSelected">
        <span
          class="item"
          @click="highLight"
        >
          <i class="uil uil-pen"></i>
        </span>
        <span
          class="item"
          @click="toggleRightSidebar"
        >
          <i class="uil uil-comment-notes"></i>
        </span>
      </span>
      <span v-show="isSelected">
        <span
          class="item"
          @click="delHighLight"
        >
          <i class="uil uil-trash"></i>
        </span>
      </span>
    </div>
    <PDFSideBar />
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
    color: #fff;
    cursor: pointer;
    display: inline-block;
    font-size: 18px;
    margin-left: 8px;
    padding-right: 5px;
    border-right: #fff 1px solid;
  }

  .item:first-child{
    margin-left: 0;
  }
  
  .item:last-child{
    padding-right: 0;
    border: none;
  }

  .item path{
    fill: #fff;
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
  .test{
    background-color: #000;
  }
</style>