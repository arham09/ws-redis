const http = require('http').createServer()
const io = require('socket.io')(http)
const port = 3636

io.sockets.on('connection', (socket) => {
  console.log('Client connected')
  socket.on('send', function (data) {
    io.sockets.emit('message', data)
  })
})

http.listen(port, () => console.log(`server listening on port: ${port}`))