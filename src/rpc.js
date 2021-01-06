const rpc = {
  tea: {

  },
  gluon: {
    getDelegates: {
        description: 'get delegates',
        params: [
          {
            name: 'start',
            type: 'u64'
          },
          {
            name: 'count',
            type: 'u64'
          },
          {
            name: 'at',
            type: 'Hash',
            isOptional: true
          }
        ],
        type: 'Vec<TeaPubKey>'
    },
  }
}

module.exports = rpc
