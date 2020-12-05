//FINAL PROJECT PART 1
const express = require("express");
const app = express();
const listener = app.listen(process.env.PORT || 3000)
//=> {console.log("Your app is listening on port " + listener.address().port);});

let bodyParser = require("body-parser");
app.use(bodyParser.raw({ type: "*/*" }));

let morgan = require("morgan");
app.use(morgan("combined"));

let cors = require("cors");
app.use(cors());

//MAPS
let users = new Map();
let banUsers = new Map();
let chann = new Map();
let channels = new Map();
let joined = new Map();
let messages = new Map();
let counterID = 150;

//SOURCECODE
app.get("/sourcecode", (req, res) => {
  res.send(require("fs").readFileSync(__filename).toString());});

//SIGNUP
app.post("/signup", (req, res) => {
  let parsed = JSON.parse(req.body);
  let username = parsed.username;
  let password = parsed.password;

  console.log("password", password);

  if (users.has(username)) {
    res.send (
      JSON.stringify ({
        success: false,
        reason: "Username exists"
      })
    );
    return;
  }

  if (password == null) {
    res.send (
      JSON.stringify ({
        success: false,
        reason: "password field missing"
      })
    );
    return;
  }

  if (username == null) {
    res.send (
      JSON.stringify ({
        success: false,
        reason: "username field missing"
      })
    );
    return;
  }

  users.set(username, password);
  res.send(
    JSON.stringify ({
      success: true
    }));
});

//LOGIN
app.post("/login", (req, res) => {
  let parsed = JSON.parse(req.body);
  let username = parsed.username;
  let actualPassword = parsed.password;
  let expectedPassword = users.get(username);

  if (actualPassword == null) {
    res.send (
      JSON.stringify ({
        success: false,
        reason: "password field missing"
      })
    );
    return;
  }

  if (username == null) {
    res.send (
      JSON.stringify ({
        success: false,
        reason: "username field missing"
      }));
    return;
  }

  if (!users.has(username)) {
    res.send (
      JSON.stringify ({
        success: false,
        reason: "User does not exist"
      }));
    return;
  }

  if (actualPassword !== expectedPassword) {
    res.send (
      JSON.stringify ({
        success: false,
        reason: "Invalid password"
      }));
    return;
  }

  let token = "chann" + counterID;
  res.send (
    JSON.stringify
    ({ success: true,
      token: token }));
  
  chann.set(token, username);
  counterID++;
});

//CREATE-CHANNEL
app.post("/create-channel", (req, res) => {
  let parsedBody = JSON.parse(req.body);
  let header = req.headers;
  let token = header.token;
  let channelName = parsedBody.channelName;

  if (token === undefined) {
    res.send (
      JSON.stringify ({
        success: false,
        reason: "token field missing"
      }));
    return;
  }

  if (channelName == null) {
    res.send (
      JSON.stringify ({
        success: false,
        reason: "channelName field missing"
      }));
    return;
  }

  if (!chann.has(token)) {
    res.send (
      JSON.stringify ({
        success: false,
        reason: "Invalid token"
      }));
    return;
  }

  if (channelName === channels.get(token)) {
    res.send (
      JSON.stringify ({
        success: false,
        reason: "Channel already exists"
      }));
    return;
  }

  res.send (
    JSON.stringify ({
      success: true
    }));
 
  channels.set(token, channelName);
});

//JOIN-CHANNEL
app.post("/join-channel", (req, res) => {
  let parsedBody = JSON.parse(req.body);
  let header = req.headers;
  let token = header.token;
  let channelName = parsedBody.channelName;

  if (token === undefined) {
    res.send (
      JSON.stringify ({
        success: false,
        reason: "token field missing"
      }));
    return;
  }

  if (!chann.has(token)) {
    res.send (
      JSON.stringify ({
        success: false,
        reason: "Invalid token"
      }));
    return;
  }

  if (channelName == null) {
    res.send(
      JSON.stringify ({
        success: false,
        reason: "channelName field missing"
      }));
    return;
  }

  let findChannel = false;
  for (let name of channels.values()) {
    if (channelName === name) {
      findChannel = true;
    }
  }
  
  if (findChannel == false) {
    res.send (
      JSON.stringify({
        success: false,
        reason: "Channel does not exist"
      }));
    return;
  }

  if (channelName === joined.get(token)) {
    res.send (
      JSON.stringify ({
        success: false,
        reason: "User has already joined"
      }));
    return;
  }

  if (chann.get(token) === banUsers.get(channelName)) {
    res.send (
      JSON.stringify ({
        success: false,
        reason: "User is banned"
      }));
    return;
  }

  res.send (
    JSON.stringify ({
      success: true
    }));
  
  joined.set(token, channelName);
  
});

//LEAVE-CHANNEL
app.post("/leave-channel", (req, res) => {
  let parsedBody = JSON.parse(req.body);
  let header = req.headers;
  let token = header.token;
  let channelName = parsedBody.channelName;

  if (token === undefined) {
    res.send (
      JSON.stringify ({
        success: false,
        reason: "token field missing"
      }));
    return;
  }

  if (!chann.has(token)) {
    res.send (
      JSON.stringify ({
        success: false,
        reason: "Invalid token"
      }));
    return;
  }

  if (channelName == null) {
    res.send (
      JSON.stringify ({
        success: false,
        reason: "channelName field missing"
      }));
    return;
  }

  let findChannel = false;
  for (let name of channels.values()) {
    if (channelName === name) {
      findChannel = true;
    }
  }
  
  if (findChannel == false) {
    res.send (
      JSON.stringify ({
        success: false,
        reason: "Channel does not exist"
      }));
    return;
  }

  let userJoins = false;
  if (channelName === joined.get(token)) {
    userJoins = true;
  }
  
  if (userJoins == false) {
    res.send(
      JSON.stringify({
        success: false,
        reason: "User is not part of this channel"
      })
    );
    return;
  }

  res.send (
    JSON.stringify 
    ({
      success: true
    }));
  
  joined.delete(token);
  
});

//JOINED
app.get("/joined", (req, res) => {
  let header = req.headers;
  let query = req.query;
  let token = header.token;
  let channelName = query.channelName;

  if (token === undefined) {
    res.send (
      JSON.stringify ({
        success: false,
        reason: "token field missing"
      }));
    return;
  }

  if (!chann.has(token)) {
    res.send (
      JSON.stringify ({
        success: false,
        reason: "Invalid token"
      }));
    return;
  }

  let findChannel = false;
  for (let name of channels.values()) {
    if (channelName === name) {
      findChannel = true;
    }
  }
  
  if (findChannel == false) {
    res.send (
      JSON.stringify ({
        success: false,
        reason: "Channel does not exist"
      }));
    return;
  }

  let userJoins = false;
  if (channelName === joined.get(token)) {
    userJoins = true;
  }
  if (userJoins == false) {
    res.send (
      JSON.stringify ({
        success: false,
        reason: "User is not part of this channel"
      }));
    return;
  }

  let usersJoined = [];
  for (let tokenList of joined.keys()) {
    if (channelName === joined.get(tokenList)) {
      let joinedUsername = "";
      joinedUsername = chann.get(tokenList);
      usersJoined.push(joinedUsername);
    }
  }
  
  res.send (
    JSON.stringify ({
      success: true,
      joined: usersJoined
    }));
});

//DELETE
app.post("/delete", (req, res) => {
  let parsedBody = JSON.parse(req.body);  
  let header = req.headers;
  let tokens = header.token;
  let channelName = parsedBody.channelName;

  if (tokens === undefined) {
    res.send (
      JSON.stringify ({
        success: false,
        reason: "token field missing"
      }));
    return;
  }

  if (!chann.has(tokens)) {
    res.send (
      JSON.stringify ({
        success: false,
        reason: "Invalid token"
      }));
    return;
  }

  if (channelName == null) {
    res.send (
      JSON.stringify ({
        success: false,
        reason: "channelName field missing"
      }));
    return;
  }

  let findChannel = false;
  for (let name of channels.values()) {
    if (channelName === name) {
      findChannel = true;
    }
  }
  
  if (findChannel == false) {
    res.send (
      JSON.stringify ({
        success: false,
        reason: "Channel does not exist"
      }));
    return;
  }

  let owner = false;
  if (channelName === channels.get(tokens)) {
    owner = true;
  }
  if (owner == false) {
    res.send (
      JSON.stringify ({
        success: false,
        reason: "Channel not owned by user"
      }));
    return;
  }

  res.send (
    JSON.stringify ({
      success: true
    }));
  
  channels.delete(tokens);
});

//KICK
app.post("/kick", (req, res) => {
  let parsedBody = JSON.parse(req.body);
  let header = req.headers;
  let tokens = header.token;
  let channelName = parsedBody.channelName;
  let kickUsers = parsedBody.target;

  if (tokens === undefined) {
    res.send (
      JSON.stringify ({
        success: false,
        reason: "token field missing"
      }));
    return;
  }

  if (!chann.has(tokens)) {
    res.send (
      JSON.stringify ({
        success: false,
        reason: "Invalid token"
      }));
    return;
  }

  if (channelName == null) {
    res.send (
      JSON.stringify ({
        success: false,
        reason: "channelName field missing"
      }));
    return;
  }

  if (kickUsers === undefined) {
    res.send (
      JSON.stringify ({
        success: false,
        reason: "target field missing"
      }));
    return;
  }

  let owner = false;
  if (channelName === channels.get(tokens)) {
    owner = true;
  }
  
  if (owner == false) {
    res.send (
      JSON.stringify ({
        success: false,
        reason: "Channel not owned by user"
      }));
    return;
  }

  for (let tokenList of joined.keys()) {
    if ((chann.get(tokenList) === kickUsers) & (joined.get(tokenList) === channelName)) {
      joined.delete(tokenList);
    }
  }

  res.send (
    JSON.stringify ({
      success: true
    }));
});

//BAN
app.post("/ban", (req, res) => {
  let parsedBody = JSON.parse(req.body);
  let header = req.headers;
  let tokens = header.token;
  let channelName = parsedBody.channelName;
  let bannedUser = parsedBody.target;

  if (tokens === undefined) {
    res.send (
      JSON.stringify ({
        success: false,
        reason: "token field missing"
      }));
    return;
  }

  if (!chann.has(tokens)) {
    res.send (
      JSON.stringify ({
        success: false,
        reason: "Invalid token"
      }));
    return;
  }

  if (channelName == null) {
    res.send (
      JSON.stringify ({
        success: false,
        reason: "channelName field missing"
      }));
    return;
  }

  if (bannedUser == undefined) {
    res.send (
      JSON.stringify ({
        success: false,
        reason: "target field missing"
      }));
    return;
  }

  let owner = false;
  if (channelName === channels.get(tokens)) {
    owner = true;
  }
  if (owner == false) {
    res.send (
      JSON.stringify ({
        success: false,
        reason: "Channel not owned by user"
      }));
    return;
  }

  res.send (
    JSON.stringify ({
      success: true
    }));
  
  banUsers.set(channelName, bannedUser);
  
});

//MESSAGE
app.post("/message", (req, res) => {
  let parsedBody = JSON.parse(req.body);
  let header = req.headers;
  let token = header.token;
  let channelName = parsedBody.channelName;
  let msgcontents = parsedBody.contents;

  if (token === undefined) {
    res.send (
      JSON.stringify ({
        success: false,
        reason: "token field missing"
      }));
    return;
  }

  if (!chann.has(token)) {
    res.send (
      JSON.stringify ({
        success: false,
        reason: "Invalid token"
      }));
    return;
  }

  if (channelName == null) {
    res.send (
      JSON.stringify ({
        success: false,
        reason: "channelName field missing"
      }));
    return;
  }

  let userJoins = false;
  if (channelName === joined.get(token)) {
    userJoins = true;
  }
  
  if (userJoins == false) {
    res.send (
      JSON.stringify ({
        success: false,
        reason: "User is not part of this channel"
      }));
    return;
  }

  if (msgcontents === undefined) {
    res.send (
      JSON.stringify ({
        success: false,
        reason: "contents field missing"
      }));
    return;
  }

  let DMs;
  if (messages.has(channelName)) {
    DMs = messages.get(channelName);
  } 
  else {
    DMs = [];
  }
  
  let user = chann.get(token);
  DMs.push({ from: user, contents: msgcontents });
  messages.set(channelName, DMs);

  res.send (
    JSON.stringify ({
      success: true
    }));
});

//MESSAGES
app.get("/messages", (req, res) => {
  let header = req.headers;
  let token = header.token;
  let query = req.query;
  let channelName = query.channelName;

  if (channelName == null) {
    res.send (
      JSON.stringify ({
        success: false,
        reason: "channelName field missing"
      }));
    return;
  }

  let findChannel = false;
  for (let name of channels.values()) {
    if (channelName === name) {
      findChannel = true;
    }
  }
  
  if (findChannel == false) {
    res.send (
      JSON.stringify ({
        success: false,
        reason: "Channel does not exist"
      }));
    return;
  }

  let userJoins = false;
  if (channelName === joined.get(token)) {
    userJoins = true;
  }
  
  if (userJoins == false) {
    res.send (
      JSON.stringify ({
        success: false,
        reason: "User is not part of this channel"
      }));
    return;
  }

  let msg = messages.get(channelName);
  if (msg == undefined) {
    res.send (
      JSON.stringify ({
        success: true,
        messages: []
      }));
  }
  
  res.send (
    JSON.stringify ({
      success: true,
      messages: msg
    }));
});