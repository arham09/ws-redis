const readline = require('readline')
const socket = require('socket.io-client')('http://localhost:3636')
const color = require("ansi-color").set
 
 
let nick;
const rl = readline.createInterface(process.stdin, process.stdout);

rl.question("Please enter a nickname: ", (name) => {
  nick = name;
  var msg = nick + " has joined the chat";
  socket.emit('send', { type: 'notice', message: msg });
  rl.prompt(true);
});

function consoleOut(msg) {
  process.stdout.clearLine();
  process.stdout.cursorTo(0);
  console.log(msg);
  rl.prompt(true);
}

rl.on('line', function (line) {
  if (line[0] == "/" && line.length > 1) {
      const cmd = line.match(/[a-z]+\b/)[0];
      const arg = line.substr(cmd.length+2, line.length);
      chatCommand(cmd, arg);

  } else {
      // send chat message
      socket.emit('send', { type: 'chat', message: line, nick: nick });
      rl.prompt(true);
  }
});

function chatCommand(cmd, arg) {
  switch (cmd) {
      case 'nick':
          const notice = nick + " changed their name to " + arg;
          nick = arg;
          socket.emit('send', { type: 'notice', message: notice });
          break;

      case 'msg':
          const to = arg.match(/[a-z]+\b/)[0];
          const message = arg.substr(to.length, arg.length);
          socket.emit('send', { type: 'tell', message: message, to: to, from: nick });
          break;

      case 'me':
          const emote = nick + " " + arg;
          socket.emit('send', { type: 'emote', message: emote });
          break;

      default:
          consoleOut("That is not a valid command.");

  }
}

socket.on('message', function (data) {
  let leader;
  if (data.type == 'chat' && data.nick != nick) {
      leader = color("<"+data.nick+"> ", "green");
      consoleOut(leader + data.message);
  }
  else if (data.type == "notice") {
      consoleOut(color(data.message, 'cyan'));
  }
  else if (data.type == "tell" && data.to == nick) {
      leader = color("["+data.from+"->"+data.to+"]", "red");
      consoleOut(leader + data.message);
  }
  else if (data.type == "emote") {
      consoleOut(color(data.message, "cyan"));
  }
});