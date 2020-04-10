<template>
  <v-flex xs12>
    <v-card>
      <v-card-title primary-title
      v-if="includeTitle"
      >
        <h3 class="headline mb-0">{{ tag.name }}</h3>
      </v-card-title>
      <v-card-text>
        <div>{{ value }}</div>
      </v-card-text>
      <v-card-actions v-if="includeTimestamp">
        {{ timestamp }}
      </v-card-actions>
    </v-card>
  </v-flex>
</template>
<script>
export default {
  id: 'valuecard',
  props: {
    nodeId: {
      type: String,
      required: true,
      default: ''
    },
    clientId: {
      type: Number,
      required: true,
      default: ''
    },
    serverId: {
      type: Number,
      required: true,
      default: ''
    },
    includeTitle: {
      type: Boolean,
      required: false,
      default: false
    },
    includeTimestamp: {
      type: Boolean,
      required: false,
      default: false
    }
  },
  computed: {
    tag: function () {
      try {
        return this.$store.state.clients[this.clientId].children[this.serverId].subscribedTags[this.nodeId]
      } catch (error) {
        return {
          'name': 'Tag not Subscribed',
          'value': 0,
          'timestamp': Date()
        }
      }
    },
    value: function () {
      var value = this.tag.value.toFixed(2)
      return value
    },
    timestamp: function () {
      var timestamp = Date(this.tag.source_timestamp)
      return timestamp
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
</style>
