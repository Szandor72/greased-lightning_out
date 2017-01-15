var express = require('express');
var http = require('http');
var https = require('https');
var fs = require('fs');
var env = require('node-env-file');

let Oauth = require('salesforce-oauth2-flow');

let oauth = new Oauth();

const parameters = {
  client_id: process.env.CONSUMERKEY,
  client_secret: process.env.SECRET,
  username: process.env.SFDC_USERNAME,
  password: process.env.SFDC_PASSWORD
}

/ Load environment variables for localhost
try {
    env(__dirname + '/.env');
} catch (e) {}

var app = express();

var port = process.env.PORT || 5000;
var https_port = process.env.HTTPS_PORT || parseInt(port) + 1;

app.set('view engine', 'ejs');

app.use(express.static(__dirname + '/public'));

var accessToken;
var instanceUrl;

oauth.getAccessToken(credentials).then(function(result) {
     console.log("display oauth result", result);
     accessToken = result.access_token;
     instanceUrl = result.instance_url;
 }).catch(function(error) {
     console.error('oauth get Access Token error ', error);
   });


app.get('/', function(req, res) {
    res.render('index', {
        appId: process.env.APPID,
        loApp: process.env.LOAPP,
        instanceUrl : instanceUrl,
        accessToken : accessToken
    });
});

app.get('/oauthcallback', function(req, res) {
    res.render('oauthcallback', {});
});

// Create an HTTP service
//
http.createServer(app).listen(port);
console.log("Server listening for HTTP connections on port ", port);

// Create a localmachine HTTPS service if the certs are present
// ftw: http://blog.matoski.com/articles/node-express-generate-ssl/
try {
    var secureServer = https.createServer({
        key: fs.readFileSync('./ssl/server.key'),
        cert: fs.readFileSync('./ssl/server.crt'),
        ca: fs.readFileSync('./ssl/ca.crt'),
        requestCert: true,
        rejectUnauthorized: false
    }, app).listen(https_port, function() {
        console.log("Secure Express server listening on port ", https_port);
    });

} catch (e) {
    console.error("Security certs not found, HTTPS not available for localhost");
}
