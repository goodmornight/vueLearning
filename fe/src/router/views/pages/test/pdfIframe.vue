<script>
import appConfig from '@src/app.config'
// import Pdf from 'vue-pdf'

// PDFJS.GlobalWorkerOptions.workerSrc = 'pdfjs-dist/build/pdf.worker.js'
// const loadingTask = Pdf.createLoadingTask('/1.pdf')
/**
 * PDF component
 */
export default {
  page: {
    title: 'PDF',
  },
}
</script>

<template>
  <iframe src="/1.pdf" width="100%" height="1300px"/>

</template>
