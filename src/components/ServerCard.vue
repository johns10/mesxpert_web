<template>
  <v-flex xs6>
    <v-card>
      <v-flex xs12 align-end flexbox>
        <v-card-title primary-title>
          <span class="headline black--text" v-text="server.name"></span>
          <v-list-tile-sub-title>{{ server.url }}</v-list-tile-sub-title>
          <v-list-tile-sub-title>{{ server.id }}</v-list-tile-sub-title>
        </v-card-title>
        <v-divider></v-divider>
          <treeview
            v-for="(child, key) in server.children"
            :items="child"
            :key="key"
            v-model="selectedItems"
            caption-field="name"
            children-field="children"
            checkbox
            toolbar
            root
          >
          </treeview>
        <v-card-actions>
          <v-btn flat="flat" v-on:click="callGetTags(server.permanent_id)">Get Tags</v-btn>
        </v-card-actions>
      </v-flex>
    </v-card>
  </v-flex>
</template>
<script>
import treeview from './treeview.vue'
import { getTags } from '../api/opc.js'
export default {
  name: 'servercard',
  props: {
    server: {
      type: Object,
      required: true,
      defaults: () => {}
    },
    selectedItems: []
  },
  components: {
    'treeview': treeview
  },
  data () {
    return { showChildren: false }
  },
  methods: {
    toggleChildren () {
      this.showChildren = !this.showChildren
    },
    callGetTags: function (serverId) {
      console.log(this)
      var clientId = this.$store.state.clientId
      var integrationClientId = this.integrationClientId
      var socket = this.$socket
      var args = {
        'integration_client_id': integrationClientId,
        'server_id': serverId
      }
      getTags(clientId, socket, args)
    }
  },
  computed: {
    indent () {
      return { transform: `translate(${this.depth * 10}px)` }
    }
  }
}
</script>
