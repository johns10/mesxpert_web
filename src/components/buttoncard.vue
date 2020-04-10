
<template>
  <v-flex xs12>
    <v-btn
      v-on:click="writeValue()"
      v-bind:color="buttonColor"
      >
      <v-icon left>{{ buttonIcon }}</v-icon>
      {{ buttonText }}
    </v-btn>
  </v-flex>
</template>
<script>

export default {
  id: 'buttoncard',
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
    onColor: {
      type: String,
      required: false,
      default: ''
    },
    offColor: {
      type: String,
      required: false,
      default: ''
    },
    offValue: {
      type: String,
      required: false,
      default: 'Off'
    },
    onIcon: {
      type: String,
      required: false,
      default: ''
    },
    offIcon: {
      type: String,
      required: false,
      default: ''
    },
    onValue: {
      type: String,
      required: false,
      default: 'On'
    },
    includeTimestamp: {
      type: Boolean,
      required: false,
      default: ''
    }
  },
  computed: {
    buttonColor: function () {
      if (this.tag.value === true) {
        return this.onColor
      } else if (this.tag.value === false) {
        return this.offColor
      }
    },
    buttonText: function () {
      if (this.tag.value === true) {
        return this.onValue
      } else if (this.tag.value === false) {
        return this.offValue
      }
    },
    buttonIcon: function () {
      if (this.tag.value === true) {
        return this.onIcon
      } else if (this.tag.value === false) {
        return this.offIcon
      }
    },
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
  },
  methods: {
    writeValue: function () {
      console.log('Component setting ' + this.name + ' to ' + this.tag.value)
      var payload = JSON.parse(JSON.stringify(this.tag))
      payload.value = !this.tag.value
      this.$store.dispatch('write', payload)
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
</style>
