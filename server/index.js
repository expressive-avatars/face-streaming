const express = require('express')
const { createServer } = require('http')
const { Server } = require('socket.io')
const jwtDecode = require('jwt-decode')

const port = process.env.PORT || 5000

const app = express()
const httpServer = createServer(app)
const io = new Server(httpServer, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
})

app.get('/', (req, res) => {
  res.send('Server is up :)')
})

const records = {}

io.of('provider').on('connection', (socket) => {
  /** @type {{ token: string }} */
  const query = socket.handshake.query

  if (query.token) {
    const { sub: accountId } = jwtDecode(query.token)
    if (accountId) {
      console.log(`Provider connected for account ID ${accountId}`)

      /**
       * Join room with accountId so primary consumer can send Hubs status updates
       * e.g. connection status, room name, avatar URL
       */
      socket.join(accountId)

      socket.on('face', (data) => {
        io.of('consumer').in(accountId).volatile.emit('face', data)
      })
    }
  } else {
    console.error('Invalid provider query:\n', JSON.stringify(query, null, 2))
  }
})

io.of('consumer', (socket) => {
  /** @type {{ type: 'primary'|'peer', email: ?string, networkId: string }} */
  const query = socket.handshake.query

  if (query.type === 'primary') {
    console.log(`Primary consumer for ${query.email} registered to ${query.networkId}`)

    socket.join(query.email)

    // Make existing peers join the room
    io.of('consumer').in(query.networkId).socketsJoin(query.email)

    // Associate networkId with email for future peers
    records[query.networkId] = query.email

    socket.on('rooms', (callback) => {
      console.log('requesting rooms')
      callback(Array.from(socket.rooms))
    })

    socket.on('disconnect', () => {
      delete records[query.networkId]
    })
  } else if (query.type === 'peer') {
    socket.join(query.networkId)
    const email = records[query.networkId]
    if (email) socket.join(email)
  }
})

httpServer.listen(port, () => {
  console.log(`server ready on http://localhost:${port}`)
})
