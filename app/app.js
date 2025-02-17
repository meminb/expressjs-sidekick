var express = require('express');
var reload = require('reload');
var app = express();
var dataFile = require('./data/data.json');
var io = require('socket.io')();


/*
Sidekick agent
*/
var sidekickDebugger = require('@runsidekick/sidekick-agent-nodejs');

sidekickDebugger.start({
  apiKey: process.env.SIDEKICK_APIKEY,
  SIDEKICK_AGENT_APPLICATION_NAME: "sidekick demo app",
  SIDEKICK_AGENT_LOG_LEVEL:"debug",
  SIDEKICK_AGENT_BROKER_HOST: "wss://broker.service.runsidekick.us" 
});


app.set('port', process.env.PORT || 3000);
app.set('appData', dataFile);
app.set('view engine', 'ejs');
app.set('views', 'app/views');

app.locals.siteTitle = 'Roux Meetups';
app.locals.allSpeakers = dataFile.speakers;

app.use(express.static('app/public'));
app.use(require('./routes/index'));
app.use(require('./routes/speakers'));
app.use(require('./routes/feedback'));
app.use(require('./routes/api'));
app.use(require('./routes/chat'));

var server = app.listen(app.get('port'), function () {
  console.log('Listening on port ' + app.get('port'));
});

io.attach(server);
io.on('connection', function (socket) {
  socket.on('postMessage', function (data) {
    io.emit('updateMessages', data);
  });
});

reload(server, app);
