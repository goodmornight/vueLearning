<script>
export default {
  props: {
    // selectedNodes: {
    //   type: Array,
    //   default: []
    // }
    content:{
      type:Object,
      default:null
    }
  },
  data() {
    return {

    }
  },
  computed:{
    // content(){
    //   mark.appendChild(node.cloneNode(false))
    //     console.log(mark)
    //     node.parentNode.replaceChild(mark, node)
    // }
  },
  mounted(){
    
  },
}
</script>
<template>
  <mark>{{content}}</mark>
</template>