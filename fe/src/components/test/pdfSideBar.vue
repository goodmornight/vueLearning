<script>
import VuePerfectScrollbar from 'vue-perfect-scrollbar'
import { authComputed, layoutMethods } from '@state/helpers'

/**
 * A right sidebar component
 */
export default {
  components: { VuePerfectScrollbar },
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
      <div class="card d-inline-block">
        <div class="card-body min-vw-100">
          <div class="media mt-2 mb-2">
            <img
              src="@assets/images/users/avatar-7.jpg"
              class="avatar-sm rounded-circle mr-2"
              alt="Shreyu"
            />
            <div class="media-body">
              <h6 class="pro-user-name">{{ user.name }}</h6>
            </div>
          </div>
          <!-- <div class="card">
            <div class="card-body">
              {{ context }}
            </div>
          </div> -->
        </div>
      </div>
    </div>
    <!-- /Right-bar -->
  </div>
</template>
