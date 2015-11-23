var fs = require("fs"),
url = require("url"),
emitter = require("events").EventEmitter,
assert = require("assert"),
mongo = require("mongodb");

var uristring = "mongodb://userName:password@mongoHost:port/dbName";
var mongoUrl = url.parse (uristring);

var app = require("http").createServer(handler),
io = require("socket.io").listen(app);

theport = 2000;
app.listen(theport);
console.log ("http server on port: " + theport);

function handler (req, res) {
  fs.readFile(__dirname + "/index.html",
  function (err, data) {
    if (err) {
      res.writeHead(500);
      return res.end("Error loading index.html");
    }
    res.writeHead(200);
    res.end(data);
  });
}

mongo.MongoClient.connect (uristring, function (err, db) {

	if(err){
		console.log(err);
		return;
	}

	var collection = db.collection('tests');

	io.sockets.on("connection", function (socket) {

		insertDocs(collection);

		console.log("browser connected");

		// Get the cursor
		var cursor = collection.find({})
			.addCursorFlag('tailable', true)
			.addCursorFlag('awaitData', true)
			.setCursorOption('numberOfRetries', 1000)
			.setCursorOption('tailableRetryInterval', 100);

		cursor.on('data', function(data) {

			socket.emit("all", data);

		});

	});

});


function insertDocs (collection) {

	collection.insertOne({"time":Date()});

	setTimeout(insertDocs, 1000, collection)
}






