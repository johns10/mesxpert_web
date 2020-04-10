import Vue from 'vue'
import Vuex from 'vuex'

import { write } from '@/api/opc.js'
import { searchTree } from '@/helpers/tree.js'

Vue.use(Vuex)

var state = {
  sessionId: 0,
  clientId: null,
  clients: {},
  socket: {
    isConnected: false,
    message: '',
    reconnectError: false
  }
}

export default new Vuex.Store({
  state,
  mutations: {
    set_client_id (state, clientId) {
      if (state.clientId === null) {
        console.log('setting client id' + clientId)
        Vue.set(state, 'clientId', clientId)
      } else {
        console.log('client id exists')
        state.clientId = clientId
      }
    },
    create_subscription (state, subscription) {
      console.log('Creating subscription')
      console.log(subscription)
      var server = state.clients[subscription.integration_client_id].children[subscription.server_id]
      var tag = searchTree(server, subscription.node_id, 'node_id')
      console.log('Server: ' + server)
      console.log('Subscription: ' + subscription)
      console.log('found tag' + tag)
      console.log('Subscriptions: ' + server.subscriptions)
      if (typeof server.subscriptions[subscription.node_id] === 'undefined') {
        console.log('Creating Subscription')
        Vue.set(server.subscriptions, subscription.node_id, tag)
        Vue.set(server.subscriptions[subscription.node_id], 'value', 0)
        Vue.set(server.subscriptions[subscription.node_id], 'server_timestamp', '')
        Vue.set(server.subscriptions[subscription.node_id], 'source_timestamp', '')
        tag = server.subscriptions[subscription.node_id]
      }
    },
    update_client (state, payload) {
      var clients = payload
      console.log('Processing client update')
      console.log(clients)
      for (var clientId in clients) {
        if (typeof state.clients[clientId] === 'undefined') {
          console.log('client not created')
          Vue.set(state.clients, clientId, clients[clientId])
        } else if (typeof state.clients[clientId] !== 'undefined') {
          console.log('updating existing client')
          state.clients[clientId] = clients[clientId]
        }
        /* for (var serverId in state.clients[clientId].children) {
          var server = state.clients[clientId].children[serverId]
          if (typeof server.subscribedTags === 'undefined') {
            // console.log('subscribed tags not created')
            Vue.set(server, 'subscribedTags', {})
          }
        } */
      }
    },
    update_tag_tree (state, payload) {
      var integrationClientId = payload.integration_client_id
      var serverId = payload.server_id
      var tagTree = payload.tag_tree
      // console.log('Tag Tree')
      // console.log(tagTree)
      var client = state.clients[integrationClientId]
      var server = client.children[serverId]
      Vue.set(server, 'children', tagTree)
    },
    update_tag_value (state, payload) {
      console.log('updating tag value')
      console.log(payload)
      var tagToUpdate = state.clients[payload.integration_client_id].children[payload.server_id].subscriptions[payload.node_id]
      tagToUpdate['value'] = payload['value']
      tagToUpdate['source_timestamp'] = payload['source_timestamp']
      tagToUpdate['server_timestamp'] = payload['server_timestamp']
    },
    SOCKET_ONCLOSE (state, event) {
      console.log('closed')
      state.socket.isConnected = false
    },
    SOCKET_ONOPEN (state, event) {
      console.log('open')
      state.socket.isConnected = true
      var clientId = this._vm.$cookies.get('client_id')
      this.commit('set_client_id', clientId)
    },
    SOCKET_ONMESSAGE (state, message) {
      console.log(message)
      var payload = message
      if (payload.message_type === 'event') {
        console.log('Got event')
      } else if (payload.message_type === 'command') {
        console.log('Got command')
        if (payload.command_type === 'PublishTags') {
          console.log('Received PublishTags Command')
          this.commit('update_tag_tree', payload.message.arguments)
        } else if (payload.command_type === 'PublishClient') {
          console.log('Received PublishClient Command')
          var client = payload.message.arguments.client
          this.commit('update_client', client)
        } else if (payload.command_type === 'set_client_id') {
          console.log('setting client id')
          var clientId = payload.arguments.client_id
          this.commit('set_client_id', clientId)
        } else if (payload.command_type === 'PublishSubscription') {
          console.log('Received PublishSubscription Command')
          var subscription = payload.message.arguments
          this.commit('create_subscription', subscription)
        } else if (payload.command_type === 'PublishTagChange') {
          console.log('Received PublishTagChange Command')
          var tagValue = payload.message.arguments
          this.commit('update_tag_value', tagValue)
        }
      }
    },
    SOCKET_RECONNECT (state, message) {
      console.log('reconnected')
      state.socket.isConnected = true
    }
  },
  actions: {
    write ({commit}, item, value) {
      item.session_id = state.sessionId
      console.log('Setting ' + item.name + ' to ' + item.value)
      write(item, Vue.prototype.$socket)
    }
  }
})
