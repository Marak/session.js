/* session managment for node.js */
var SESSION_TIMEOUT = 60 * 1000;
var sessions = [];

function createSession (id) {
  if (sessions[id] === undefined) {
    // Create session
    sessions[id] = {
      timestamp: 0,
      queue: [],
      result: [],
      cmd: 0
    };
  }
}

/* interval to kill off old sessions */
setInterval(function () {
  var now = new Date();
  for (var id in sessions) {
    if (!sessions.hasOwnProperty(id)) continue;
    var session = sessions[id];

    if (now - session.timestamp > SESSION_TIMEOUT) {
      delete sessions[id];
    }
  }
}, 1000);
