<script>
import Layout from '@layouts/main'
import Pdf from 'vue-pdf'
const loadingTask = Pdf.createLoadingTask('/1.pdf')
/**
 * PDF component
 */
export default {
  page: {
    title: 'vue-pdf'
  },
  components: { Layout, Pdf },
  data() {
    return {
      title: 'PDF',
      src: loadingTask,
      numPages: undefined,
      currentPage: 1,
      pageCount: 0,
    }
  },
  mounted(){
    this.src.promise.then(pdf => {
      this.numPages = pdf.numPages
    })
  },
  methods:{
    logContent() {
      this.$refs.myPdfComponent.pdf.forEachPage(function(page) {
        return page.getTextContent()
        .then(function(content) {
          var text = content.items.map(item => item.str);
          console.log(text);
        })
      })
    },
    // 获取pdf当前页数
    getCurPage(e){
      this.currentPage = e
    },
    // 获取pdf总页数
    getPageCount(e){
      this.pageCount = e
    }
  }
}
</script>

<template>
  <Layout>
    <div class="row page-title align-items-center">
      <div class="col-md-12">
        <form class="form-inline">
          <div class="form-group mr-3">
            <input
              v-model.number="currentPage"
              type="number"
              class="form-control"
              :min="1"
              :max="pageCount"
            />
          </div>
          <div class="form-group mr-3">
            <span>/ {{pageCount}}</span>
          </div>
          <b-button variant="primary" @click="logContent">logContent</b-button>
        </form>
      </div>
    </div>
  
  <Pdf 
    ref="myPdfComponent"
    src="/1.pdf"
    :page = "currentPage"
    @num-pages="getPageCount"
    @page-loaded="getCurPage"
    />
  </Layout>
</template>
