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
      type: 'Vec<(Cid, TeaPubKey, Cid)>'
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
    encodeTask: {
      description: 'encode task',
      params: [
        {
          name: 'task',
          type: 'AccountGenerationDataWithoutP3'
        },
        {
          name: 'at',
          type: 'Hash',
          isOptional: true
        }
      ],
      type: 'Vec<u8>'
    },
    encodeAccountGenerationWithoutP3: {
      description: 'encode data',
      params: [
        {
          name: 'keyType',
          type: 'Vec<u8>'
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
          type: 'Vec<u8>'
        },
        {
          name: 'delegatorNonceRsa',
          type: 'Vec<u8>'
        },
        {
          name: 'p1',
          type: 'Vec<u8>'
        },
        {
          name: 'at',
          type: 'Hash',
          isOptional: true
        }
      ],
      type: 'Vec<u8>'
    }
  }
}

module.exports = rpc
