import express from 'express'
import { createServer } from 'http'
import { Server } from 'socket.io'
import jwtDecode from 'jwt-decode'
import { initialBlendShapes } from '../src/utils/blendShapes.js'

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

// Maps networkId to accountId
const records = {}

io.of('provider').on('connection', (socket) => {
  /** @type {{ token: string }} */
  const query = socket.handshake.query

  if (query.token) {
    const accountId = jwtDecode(query.token).sub
    if (accountId) {
      console.log(`Provider connected for account ID ${accountId}`)

      /**
       * Join room with accountId so primary consumer can send Hubs status updates
       * e.g. connection status, room name, avatar URL
       */
      socket.join(accountId)

      const primaryConsumer = io.of('consumer').in('primary').in(accountId)
      const allConsumers = io.of('consumer').in(accountId)

      /**
       * Request user status from Hubs
       */
      primaryConsumer.emit('provider_join')

      socket.on('state', (...args) => {
        primaryConsumer.emit('state', ...args)
      })

      socket.on('face', (data) => {
        allConsumers.volatile.emit('face', data)
      })

      socket.on('disconnect', () => {
        // Reset face
        allConsumers.volatile.emit('face', { blendShapes: initialBlendShapes, headOrientation: [0, 0, 0, 1] })
      })
    }
  } else {
    console.error('Invalid provider query:\n', JSON.stringify(query, null, 2))
  }
})

io.of('consumer', (socket) => {
  /** @type {{ type: 'primary'|'peer', token: ?string, networkId: string }} */
  const query = socket.handshake.query

  socket.join(query.type)

  if (query.type === 'primary' && query.token && query.networkId) {
    const accountId = jwtDecode(query.token).sub

    console.log(`Primary consumer for accountId ${accountId} registered to ${query.networkId}`)

    socket.join(accountId)

    // Make existing peers join the room
    io.of('consumer').in(query.networkId).socketsJoin(accountId)

    // Associate networkId with accountId for future peers
    records[query.networkId] = accountId

    const iOSDevice = io.of('provider').in(accountId)

    // Forward latest hub name from desktop to iOS
    socket.on('hub_name', (name) => {
      iOSDevice.emit('hub_name', name)
    })

    // Forward latest avatar URL from desktop to iOS
    socket.on('avatar_url', (url) => {
      iOSDevice.emit('avatar_url', url)
    })

    // Desktop wants iOS to perform an action (e.g. calibrate, pause)
    socket.on('action', (...args) => {
      iOSDevice.emit('action', ...args)
    })
    socket.on('state', (...args) => {
      iOSDevice.emit('state', ...args)
    })

    socket.on('disconnect', () => {
      delete records[query.networkId]
      iOSDevice.emit('state', { hubName: null, avatarURL: null })
    })
  } else if (query.type === 'peer') {
    // Join room with networkId initially, in case we join before primary consumer
    socket.join(query.networkId)

    // If primary consumer already joined, then use the existing accountId record
    const accountId = records[query.networkId]
    if (accountId) socket.join(accountId)
  }
})

httpServer.listen(port, () => {
  console.log(`server ready on http://localhost:${port}`)
})
