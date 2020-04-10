import gql from 'graphql-tag'

export const ALL_OPC_SERVERS_QUERY = gql`
  query AllOpcServersQuery {
    opcServers {
      id
      runtimeId
      name
      url
    }
  }
`
