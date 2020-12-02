<script>
import VuePerfectScrollbar from 'vue-perfect-scrollbar'
import { authComputed, layoutMethods } from '@state/helpers'
// import { Editor } from '@toast-ui/vue-editor'

// import 'codemirror/lib/codemirror.css'
// import '@toast-ui/editor/dist/toastui-editor.css'

/**
 * A right sidebar component
 */
export default {
  components: {
    VuePerfectScrollbar,
    // Editor
  },
  props:{
    context:{
      type: String,
      default: ''
    },
  },
  data() {
    return {
      config: {
        handler: this.handleRightBarClick,
        middleware: this.middleware,
        events: ['click'],
      },
      user: this.$store ? this.$store.state.auth.currentUser : {} || {},
    }
  },
  computed: {
    ...authComputed,
  },
  methods: {
    ...layoutMethods,
    hide() {
      this.$parent.toggleRightSidebar()
    },
    handleRightBarClick(e, el) {
      if (e.target && e.target.classList.contains('rightbar-overlay'))
        this.$parent.hideRightSidebar()
    },
    middleware(event, el) {
      return !event.target.classList.contains('toggle-right')
    },
  },
}
</script>

<template>
  <div>
    <!-- Right Sidebar -->
    <div v-click-outside="config" class="pdf-right-bar">
      <div class="rightbar-title">
        <a
          href="javascript:void(0);"
          class="pdf-right-bar-toggle float-right"
          @click="hide"
        >
          <feather type="x-circle"></feather>
        </a>
        <h5 class="m-0">笔记</h5>
      </div>
      <div class="card d-inline-block edit-card">
        <div class="card-body">

          <div class="d-flex flex-row align-self-center mb-2">
            <img
              class="avatar-sm rounded-circle mr-2"
              src="@assets/images/users/avatar-7.jpg"
              alt="avatar"
            />
            <div class="info-body d-flex flex-column align-self-center overflow-text">
              <span class="author">{{ user.name }}</span>
              <span class="update-time">
                {{ new Date() | moment("YY/MM/DD HH:mm:ss") }}
                <!-- {{ new Date() | moment('YY/MM/DD HH:mm:ss') }} -->
              </span>
            </div>
          </div>

          <b-form-textarea></b-form-textarea>
          <!-- <Editor /> -->
          
        </div>
      </div>
    </div>
    <!-- /Right-bar -->
  </div>
</template>
<style type="text/css">
.edit-card {
  width: 100%;
}
.info {
  display: flex;
  align-items: flex-start;
  margin: 2rem 0;
}
.info-body {
  flex: 1;
}
.author {
  font-size: 16px;
  line-height: 1rem;
  /*margin-top: 0;
  margin-bottom: 0;*/
}
.update-time {
  font-size: 0.6rem;
  color: green;
  margin-top: 0;
  margin-bottom: 0;
}
</style>