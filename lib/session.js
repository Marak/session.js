// sessions module for node
// inimino@inimino.org
// 2009-12-01
// MIT License

var sessions={}
  , timeout

exports.lookupOrCreate=lookupOrCreate

// this should not normally be used, but it's there if you want to access the session store from a debugger
exports.sessionRoot=sessions

function ownProp(o,p){return Object.prototype.hasOwnProperty.call(o,p)}

function lookupOrCreate(req,opts){var id,session
  opts=opts||{}
  // find or generate a session ID
  id=idFromRequest(req,opts)

  // if the session exists, use it
  if(ownProp(sessions,id)){
    session=sessions[id]}
  // otherwise create a new session object with that ID, and store it
  else{
    session=new Session(id,opts)
    sessions[id]=session}

  // set the time at which the session can be reclaimed
  session.expiration=(+new Date)+session.lifetime*1000
  // make sure a timeout is pending for the expired session reaper
  if(!timeout)
    timeout=setTimeout(cleanup,60000)

  return session}

function cleanup(){var id,now,next
  now = +new Date
  next=Infinity
  timeout=null
  for(id in sessions) if(ownProp(sessions,id)){
    if(sessions[id].expiration < now){
      delete sessions[id]}
    else next = next<sessions[id].expiration ? next : sessions[id].expiration}
  if(next<Infinity)
    timeout=setTimeout(cleanup,next - (+new Date) + 1000)}

function idFromRequest(req,opts){var m
  // look for an existing SID in the Cookie header for which we have a session
  if(req.headers.cookie
  && (m = /SID=([^ ,;]*)/.exec(req.headers.cookie))
  && ownProp(sessions,m[1])){
    return m[1]}

  // otherwise we need to create one
  // if an ID is provided by the caller in the options, we use that
  if(opts.sessionID) return opts.sessionID
  // otherwise a 64 bit random string is used
  return randomString(64)}

function Session(id,opts){
  this.id=id
  this.data={}
  this.path=opts.path||'/'
  this.domain=opts.domain
  // if the caller provides an explicit lifetime, then we use a persistent cookie
  // it will expire on both the client and the server lifetime seconds after the last use
  // otherwise, the cookie will exist on the browser until the user closes the window or tab,
  // and on the server for 24 hours after the last use
  if(opts.lifetime){
    this.persistent = 'persistent' in opts ? opts.persistent : true
    this.lifetime=opts.lifetime}
  else{
    this.persistent=false
    this.lifetime=86400}}

// randomString returns a pseude-random ASCII string which contains at least the specified number of bits of entropy
// the return value is a string of length ⌈bits/6⌉ of characters from the base64 alphabet
function randomString(bits){var chars,rand,i,ret
  chars='ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/'
  ret=''
  // in v8, Math.random() yields 32 pseudo-random bits (in spidermonkey it gives 53)
  while(bits > 0){
    rand=Math.floor(Math.random()*0x100000000) // 32-bit integer
    // base 64 means 6 bits per character, so we use the top 30 bits from rand to give 30/6=5 characters.
    for(i=26; i>0 && bits>0; i-=6, bits-=6) ret+=chars[0x3F & rand >>> i]}
  return ret}

Session.prototype.getSetCookieHeaderValue=function(){var parts
  parts=['SID='+this.id]
  if(this.path) parts.push('path='+this.path)
  if(this.domain) parts.push('domain='+this.domain)
  if(this.persistent) parts.push('expires='+dateCookieString(this.expiration))
  return parts.join('; ')}

// from milliseconds since the epoch to Cookie 'expires' format which is Wdy, DD-Mon-YYYY HH:MM:SS GMT
function dateCookieString(ms){var d,wdy,mon
  d=new Date(ms)
  wdy=['Sun','Mon','Tue','Wed','Thu','Fri','Sat']
  mon=['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
  return wdy[d.getUTCDay()]+', '+pad(d.getUTCDate())+'-'+mon[d.getUTCMonth()]+'-'+d.getUTCFullYear()
    +' '+pad(d.getUTCHours())+':'+pad(d.getUTCMinutes())+':'+pad(d.getUTCSeconds())+' GMT'}

function pad(n){return n>9 ? ''+n : '0'+n}

Session.prototype.destroy=function(){
  delete sessions[this.id]}

Session.prototype.serialize // unimplemented, but would store the session on disk