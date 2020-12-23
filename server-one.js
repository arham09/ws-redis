const http = require('http').createServer()
const io = require('socket.io')(http)
const port = 3636

const APP_ID = 'APP-90'
const APP_ID_DST = 'APP-91'

const redis = require('redis')
const subscriber = redis.createClient()
const publisher = redis.createClient()

io.sockets.on('connection', (socket) => {
  console.log('Client connected')
  socket.on('send', (data) => {
    publisher.publish(`chat${APP_ID_DST}`, JSON.stringify(data))
  })

  subscriber.on("message", (channel, message) => {
    io.sockets.emit('message', JSON.parse(message))
  })

  subscriber.subscribe(`chat${APP_ID}`)
})

http.listen(port, () => console.log(`server listening on port: ${port}`))