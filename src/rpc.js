const rpc = {
      tea: {
            getNodeByEphemeralId: {
                  description: 'Just a test method',
                  params: [
                    {
                      name: 'key_hex',
                      type: 'String'
                    },
                    {
                      name: 'at',
                      type: 'Hash',
                      isOptional: true
                    }
                  ],
                  type: 'Option<Node>'
            },
            getSum: {
                  description: 'Just a test method',
                  params: [
                    {
                      name: 'at',
                      type: 'Hash',
                      isOptional: true
                    }
                  ],
                  type: 'u32'
            }
      }
}

module.exports = rpc;
