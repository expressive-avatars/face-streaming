const express = require('express')
const { createServer } = require('http')
const { Server } = require('socket.io')

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
  socket.on('blendShapes', (blendShapes) => {
    socket.broadcast.volatile.emit('blendShapes', blendShapes)
  })
})

httpServer.listen(5000, () => {
  console.log('server ready on http://localhost:5000')
})
