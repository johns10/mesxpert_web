<template>
  <v-container fluid>
    <v-layout row wrap>
        <v-flex xs12>
          <servercard
            v-for="server in opcServers"
            :key="server.id"
            :server="server"
            class="ma-2"
          >
          </servercard>
        </v-flex>
        <v-flex xs3>
          <valuecard
            node-id="ns=2;i=2"
            v-bind:client-id="1"
            v-bind:server-id="1"
            include-title
            include-timestamp
            class="ma-2"
          >
          </valuecard>
          <buttoncard
            node-id="ns=2;i=3"
            v-bind:client-id="1"
            v-bind:server-id="1"
            on-icon="check"
            off-icon="cancel"
            on-color="success"
            off-color="error"
            on-value="It's On"
            off-value="It's Off"
            include-timestamp
          >test
        </buttoncard>
        <p
          v-for="server in opcServers"
          :key="server.id">
          {{ server }}
        </p>
        </v-flex>
      </v-flex>
    </v-layout>
  </v-container>
</template>

<script>
import { getIntegrationClients, getServers } from '../api/opc.js'
import { ALL_OPC_SERVERS_QUERY } from '../constants/graphql'
import servercard from './servercard.vue'
import valuecard from './valuecard.vue'
import buttoncard from './buttoncard.vue'

export default {
  name: 'helloworld',
  data () {
    return {
      msg: 'Welcome to Your Vue.js App',
      allServers: [],
      loading: 0
    }
  },
  props: {
    // servers: Object
  },
  components: {
    'servercard': servercard,
    'valuecard': valuecard,
    'buttoncard': buttoncard
  },
  apollo: {
    $query: {
      loadingKey: 'loading'
    },
    opcServers: {
      query: ALL_OPC_SERVERS_QUERY
    }
  },
  methods: {
    callGetIntegrationClients: function () {
      var clientId = this.$store.state.clientId
      var socket = this.$socket
      getIntegrationClients(clientId, socket)
    },
    callGetServers: function (integrationClientId) {
      var webClientId = this.$store.state.clientId
      var socket = this.$socket
      getServers(socket, webClientId, integrationClientId, [])
    }
  },
  computed: {
    clients () {
      return this.$store.state.clients
    },
    opc_servers () {
      return this.$store.state.clients.servers
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
</style>
