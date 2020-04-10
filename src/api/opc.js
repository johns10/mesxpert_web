// import { post } from '@/helpers/http'

// const BASE_URL = 'http://localhost:1000'
const uuidv4 = require('uuid/v4')

export function generateCommand (webClientId, commandType, args) {
  console.log('Generating Command')
  var object = {
    'message_type': 'command',
    'command_type': commandType,
    'message': {
      'arguments': args
    }
  }
  object.message.arguments.web_client_ids = [webClientId]
  object.message.arguments.command_id = uuidv4()
  return object
}

export function write (args, socket) {
  console.log('Writing ' + args.value + ' to ' + args.id)
  var object = {
    'message_type': 'command',
    'command': 'write_tag',
    'message': {
      'arguments': args
    }
  }
  socket.sendObj(object)
}

export function getIntegrationClients (clientId, socket) {
  var args = {
    'integration_client_ids': []
  }
  var message = generateCommand(clientId, 'GetIntegrationClients', args)
  console.log('Sending getIntegrationClients command')
  socket.sendObj(message)
}

export function getServers (socket, webClientId, integrationClientId, serverIds) {
  var args = {
    'integration_client_id': integrationClientId,
    'serverIds': serverIds
  }
  var message = generateCommand(webClientId, 'GetServers', args)
  console.log('sending GetServers command on client: ', integrationClientId)
  socket.sendObj(message)
}

export function getTags (clientId, socket, args) {
  var message = generateCommand(clientId, 'GetTags', args)
  console.log(message)
  socket.sendObj(message)
}

export function createSubscription (clientId, socket, args) {
  console.log('Creating subscription')
  args.subscription_interval = 500 // change this to dynamic later
  var message = generateCommand(clientId, 'CreateSubscription', args)
  socket.sendObj(message)
}

export function unsubscribeTags (clientId, socket, args) {
  var message = generateCommand(clientId, 'UnsubscribeTags', args)
  socket.sendObj(message)
}
