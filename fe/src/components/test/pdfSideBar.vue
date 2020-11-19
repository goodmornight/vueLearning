<script>
import VuePerfectScrollbar from 'vue-perfect-scrollbar'
import { authComputed, layoutMethods } from '@state/helpers'

/**
 * A right sidebar component
 */
export default {
  components: { VuePerfectScrollbar },
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
        <div class="card-body">
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
          <div class="card">
            <div class="card-body">
              It will be as simple as occidental in fact it will be
              Occidental Cambridge friend
            </div>
          </div>
          <!-- <div>
            <a
              href="javascript: void(0)"
              class="btn btn-primary btn-sm"
              >Read more</a
            >
          </div> -->
        </div>
      </div>
      <!-- <div class="slimscroll-menu pb-5">
        <VuePerfectScrollbar style="height: 100%">
          <h5 class="font-size-16 pl-3 mt-4">Choose Variation</h5>
          <div class="p-3">
            <h6>Default</h6>
            <a href="javascript: void(0);" @click="changeLayout('vertical')">
              <img
                src="@assets/images/layouts/vertical.jpg"
                alt="vertical"
                class="img-thumbnail demo-img"
              />
            </a>
          </div>
          <div class="px-3 py-1">
            <h6>Top Nav</h6>
            <a href="javascript: void(0);" @click="changeLayout('horizontal')">
              <img
                src="@assets/images/layouts/horizontal.jpg"
                alt="horizontal"
                class="img-thumbnail demo-img"
              />
            </a>
          </div>
          <div class="px-3 py-1">
            <h6>Dark Side Nav</h6>
            <a href="javascript: void(0);" @click="changeTheme('dark')">
              <img
                src="@assets/images/layouts/vertical-dark-sidebar.jpg"
                alt="dark sidenav"
                class="img-thumbnail demo-img"
              />
            </a>
          </div>
          <div class="px-3 py-1">
            <h6>Condensed Side Nav</h6>
            <a href="javascript: void(0);" @click="changeType('condensed')">
              <img
                src="@assets/images/layouts/vertical-condensed.jpg"
                alt="condensed"
                class="img-thumbnail demo-img"
              />
            </a>
          </div>
          <div class="px-3 py-1">
            <h6>Fixed Width (Boxed)</h6>
            <a href="javascript: void(0);" @click="changeWidth('boxed')">
              <img
                src="@assets/images/layouts/boxed.jpg"
                alt="boxed"
                class="img-thumbnail demo-img"
              />
            </a>
          </div>
        </VuePerfectScrollbar>
      </div> -->
      <!-- end slimscroll-menu-->
    </div>
    <!-- /Right-bar -->
  </div>
</template>
