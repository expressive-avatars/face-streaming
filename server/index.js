const express = require('express')
const { createServer } = require('http')
const { Server } = require('socket.io')

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

io.on('connection', (socket) => {
  console.log('a user connected')
  socket.on('face', (data) => {
    socket.broadcast.volatile.emit('face', data)
  })
})

httpServer.listen(port, () => {
  console.log(`server ready on http://localhost:${port}`)
})
