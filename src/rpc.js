const rpc = {
  tea: {
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
      type: 'Vec<(TeaPubKey, TeaPubKey)>'
    },
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
    encodeAccountGenerationWithoutP3: {
      description: 'get delegates',
      params: [
        {
          name: 'keyType',
          type: 'Bytes'
        },
        {
          name: 'n',
          type: 'u32'
        },
        {
          name: 'k',
          type: 'u32'
        },
        {
          name: 'delegatorNonceHash',
          type: 'Bytes'
        },
        {
          name: 'delegatorNonceRsa',
          type: 'Bytes'
        },
        {
          name: 'p1',
          type: 'Bytes'
        },
        {
          name: 'at',
          type: 'Hash',
          isOptional: true
        }
      ],
      type: 'Bytes'
    }
  }
}

module.exports = rpc
