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

// vite will proxy all /server requests
const endpoint = io.of('/server')

io.on('connection', (socket) => {
  console.log('a user connected')
  socket.send('hello from server')
  socket.on('blendShapes', (blendShapes) => {
    // socket.broadcast.emit('blendShapes', blendShapes)
    console.log(blendShapes.jawOpen)
  })
})

httpServer.listen(5000)
