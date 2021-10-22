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

io.on('connection', (socket) => {
  console.log('a user connected')
  socket.on('blendShapes', (blendShapes) => {
    socket.broadcast.emit('blendShapes', blendShapes)
  })
})

httpServer.listen(5000)
