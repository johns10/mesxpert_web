// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import App from './App'
import router from './router'
import Vuetify from 'vuetify'
import VueNativeSock from 'vue-native-websocket'
import VueCookies from 'vue-cookies'
import ApolloClient from 'apollo-boost'
import VueApollo from 'vue-apollo'

import 'vuetify/dist/vuetify.min.css'
import store from './store/store.js'
import helloworld from './components/HelloWorld.vue'
import valuecard from './components/valuecard.vue'

require('vuetify/src/stylus/app.styl')

Vue.config.productionTip = false
const apolloProvider = new VueApollo({
  defaultClient: new ApolloClient({
    uri: 'http://localhost:1000/graphql'
  })
})

Vue.use(Vuetify)
Vue.use(VueCookies)
Vue.use(VueNativeSock, 'ws://localhost:1000/ws', {
  reconnection: true,
  reconnectionAttempts: 5,
  reconnectionDelay: 3000,
  store: store,
  format: 'json'
})
Vue.use(VueApollo)

/* eslint-disable no-new */
new Vue({
  el: '#app',
  apolloProvider,
  store,
  components: {
    'HelloWorld': helloworld,
    'valuecard': valuecard
  },
  router,
  render: h => h(App),
  beforeCreate: function () {
    this.$cookies.config('30d')
  }
})
