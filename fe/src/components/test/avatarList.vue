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
  <div class="right-side-avatars" v-for="item in avatarList" :style="{top:`${item.top}px`}">
    <h6 class="pro-user-name mt-0 mb-0" style="overflow: hidden;text-overflow: ellipsis;white-space: nowrap;">{{ currentUser.username }}</h6>
  </div>
</template>