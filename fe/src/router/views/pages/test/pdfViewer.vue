<script>
// pdfViewer加载+web-highlighter高亮
import PDFPage from '@components/test/pdfPage'
import PDFSideBar from '@components/test/pdfSideBar'
import PDFTools from '@components/test/pdfTools'
// import PDFFooter from '@components/test/pdfFooter'
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
    PDFTools,
    PDFSideBar,
    // PDFFooter
  },
  data() {
    return {
      scrollTop:0,
      url:'/1.pdf',
      curPage: 1,
      numPages: 0,
      loadingTask: null,
      pageHeight: 0,
      x: 0,
      y: 0,
      isShowTools: false,
      isSelected: false,
      curID: '',
      highlighter: null,
      store: null,
      defaultStyle: 'highLight', // 默认高亮样式
      highLightContext: '',      // 高亮文本内容
    }
  },
  computed: {
    // 判断是否位于顶部
    isTop() {
      return this.scrollTop < 100
    },

  },
  mounted() {

    this.initHighLighter(this.highlighter)
    window.addEventListener('scroll', this.getCurPage)

  },
  destroyed() {

    window.removeEventListener('scroll', this.getCurPage)

  },
  methods:{

    // 初始化web-highlighter插件
    initHighLighter() {
      let vm = this

      vm.highlighter = new Highlighter({
        wrapTag: 'span',
        exceptSelectors: ['pre', 'code', 'h5', 'h6'],
        style:{
          className: vm.defaultStyle
        }
      })
      console.log(vm.highlighter)
      vm.store = new LocalStore()

      vm.highlighter
      .on(Highlighter.event.CREATE, ({sources, type}) => {
          log('create -', sources)
          console.log(type)
          vm.curID = sources.id
          vm.styleControl(sources)

          sources = sources.map(hs => ({hs}))
          // save to backend
          vm.store.save(sources)
          vm.isShowTools = false
          vm.isSelected = false
      })
      .on(Highlighter.event.HOVER, ({id}) => {

          const selection = window.getSelection()
          vm.isShowTools = true
          vm.isSelected = true
          vm.curID = id
          // 鼠标放置高亮文本处，改变样式
          vm.highlighter.addClass('highlight-wrap-hover', id)
          
          if(selection.isCollapsed){
            // 未选中文本
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
      .on(Highlighter.event.REMOVE, ({ids}) => {
          ids.forEach(id => {
            vm.curID = id
            vm.store.remove(id)
          })
          vm.isShowTools = false
          vm.isSelected = false
      })
    },

    // 高亮显示控制
    styleControl(sources) {

      if(!sources.length || !sources[0].extra) return

      const { id, extra } = sources[0]
      const { className: style } = extra

      if(style === this.defaultStyle) return

      this.highlighter.removeClass('highLight', id)
      this.highlighter.addClass('dashedUnderLine', id)

    },

    // 计算按钮位置
    getToolLocation(node) {

      const { x, y, width } = node.getBoundingClientRect()
      this.x = x + (width / 2)
      this.y = y + window.scrollY - 10

    },

    // 选中文本触发事件
    range() {

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
    selectionTool(selection) {

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
    highLight(className) {
      console.log('高亮')
      const selection = window.getSelection()
      const range = selection.getRangeAt(0)

      this.highLightContext = range.toString()
      // 为选区序列化时的持久化数据生成额外信息
      this.highlighter.hooks.Serialize.RecordInfo.tap(function (start, end, root) {
        return {
          className: className
        }
      })

      // 使用web-highlighter高亮文本
      this.highlighter.fromRange(range)

      this.isShowTools = false
      this.isSelected = false
      selection.removeRange(range)

    },

    // 虚线下划线
    dashedUnderLine(){
      this.highLight('dashedUnderLine')
      this.toggleRightSidebar()
    },

    // 删除高亮
    delHighLight(){

      console.log('删除高亮')
      this.highlighter.remove(this.curID)
      this.isShowTools = false

    },

    // 已保存的高亮显示
    storedHighLight(pageHeight){

      const vm = this
      this.pageHeight = pageHeight

      vm.store.getAll().forEach(({hs}) => {
        vm.highlighter.fromStore(hs.startMeta, hs.endMeta, hs.text, hs.id, hs.extra)
      })
    },

    // 右侧笔记添加栏显示与关闭
    toggleRightSidebar() {
      document.body.classList.toggle('pdf-right-bar-enabled')
    },

    // 获得当前页码
    getCurPage(){
      const vm = this
      this.scrollTop = window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop
      this.curPage = Math.ceil((this.scrollTop + 5) / vm.pageHeight)
    },

    // 获得页面总数
    getNumPages(num){
      this.numPages = num
    },
    // 获得pdf页面高度
    getPageHeight(h){
      this.pageHeight = h
    },
    // 跳转到对应页面
    scrollToPage(){
      let top = (this.curPage - 1) * this.pageHeight
      this.scrollToSomeWhere(top)
    },
    // 跳转到某一个位置
    scrollToSomeWhere(top){
      window.scrollTo({
        top: top,
        behavior: 'smooth'
      })
    },
  }
}
</script>

<template>
  <div style="min-height 100%">

    <PDFPage
      :url="url"
      v-on="{
        range,
        storedHighLight,
        numPages:getNumPages,
        pageHeight:getPageHeight
      }"
    />

    <PDFTools
      v-show="isShowTools"
      :x="x"
      :y="y"
      :is-selected="isSelected"
      @highLight="highLight"
      @dashedUnderLine="dashedUnderLine"
      @delHighLight="delHighLight"
    />

    <PDFSideBar
      :context="highLightContext"
    />
    
    <transition name="fade">
      <!-- <PDFFooter
        v-show="!isTop"
        v-bind="{
          curPage,
          numPages
        }"
        v-on="{
          scrollToPage,
          scrollToTop: scrollToSomeWhere
        }"
      /> -->
      <div v-show="!isTop" class="pdf-footer">
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
        <div class="to-top" @click="scrollToSomeWhere(0)">
          <i class="uil uil-top-arrow-to-top"></i>
        </div>
      </div>
    </transition>
  </div>
</template>

<style type="text/css">
  html{
    /*scroll-behavior:smooth;*/
  }
  body{
    padding:0;
    text-align: middle;
    /*scroll-behavior:smooth;*/
  }
  .container{
    width: 80%;
    font-size: 16px;
    /*line-height: 32px;*/
    margin: 10% auto;
  }
  .highLight{
    background-color: #fc0;
  }
  .dashedUnderLine{
    border-bottom: 2px dashed #000;
  }
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
/*  .pdf-footer:hover .page-numCon{
    visibility: visible;
  }
  .page-numCon{
    visibility: hidden;
  }*/
  .fade-enter-active, .fade-leave-active {
    transition: opacity .5s;
  }
  .fade-enter, .fade-leave-to {
    opacity: 0;
  }
</style>