const express = require('express');
const bodyParser = require('body-parser');
const request = require('request');
const path = require('path');
const urlencode = require('urlencode');
let app = express();
const FB_APP_ID = process.env.FACEBOOK_APP_ID;
const FB_APP_SECRET = process.env.FACEBOOK_APP_SECRET;
let fbShortenToken = process.env.fbtk20;
let resp_text = process.env.resp_text;
let PM_text = process.env.PM_text;
let fansPageid=process.env.fansPageid;
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: true
}));
app.get('/webhook', function(req, res) {
  if (req.query['hub.mode'] === 'subscribe' &&
      req.query['hub.verify_token'] === process.env.VERIFY_TOKEN) {
    console.log("Validating webhook");
    res.status(200).send(req.query['hub.challenge']);
  } else {
    console.error("Failed validation. Make sure the validation tokens match.");
    res.sendStatus(403);          
  }
});
app.get('/web', function(req, res) {
	let posttxt = "Your app was successfully deployed. FB Bot"
    res.writeHead(200, {'Content-Type': 'text/html'});
    res.write(`<html><head><title>Facebook Messenger Bot</title></head><body><h1>Facebook Messenger Bot</h1>${posttxt} design by <a href='https://www.facebook.com/jing.pan.5'>JingPan</a>.<br><br><iframe src='https://www.facebook.com/plugins/post.php?href=https%3A%2F%2Fwww.facebook.com%2Fjing.pan.5%2Fposts%2F1710206618990813&width=500&show_text=true&appId=515825845433689&height=671' width='500' height='671' style='border:none;overflow:hidden' scrolling='no' frameborder='0' allowTransparency='true'></iframe></body></html>`);
    res.end();
  });
  app.post('/webhook', function (req, res) {
    console.log(req.body);
    var data = req.body;
    if (data.object === 'page') {
      data.entry.forEach(function(entry) {
        entry.changes.forEach(function(event) {
            if (event.field=="feed" && event.value.sender_id!=fansPageid && event.value.verb === 'add') {
              weeklyFacebookPost( event.value.message , event.value.sender_name , event.value.comment_id);
            } 
          });
      });
      res.sendStatus(200);
    }
  });
  
function weeklyFacebookPost(msg,name , commentId) {
    "use strict";
    let extend_token_url = `https://graph.facebook.com/v2.10/oauth/access_token?grant_type=fb_exchange_token&client_id=${FB_APP_ID}&amp&client_secret=${FB_APP_SECRET}&amp&fb_exchange_token=${fbShortenToken}`
    request(extend_token_url, function(err, response, body){
        let access_token = JSON.parse(body).access_token;
        fbShortenToken = access_token;
        request(`https://graph.facebook.com/${fansPageid}?fields=access_token&access_token=${access_token}`, function (err, response, body) {
            let access_token = JSON.parse(body).access_token;
            if (msg!=null){              
            let post_message = urlencode(PM_text, 'utf-8');            
            let comment_id = commentId;
            let post_page_url = `https://graph.facebook.com/v2.10/${comment_id}/private_replies?message=${post_message}&access_token=${access_token}`;
              request.post(post_page_url, function (err, response, body) {
                  console.log(body);
              })
              post_message = urlencode(resp_text, 'utf-8');
              post_page_url = `https://graph.facebook.com/v2.10/${comment_id}/comments?message=${post_message}&access_token=${access_token}`;
                request.post(post_page_url, function (err, response, body) {
                    console.log(body);
                })
                setTimeout(function2, 2000);
          }
        })
    });
} 
var server = app.listen(process.env.PORT || 3000, function () {
    console.log("Listening on port %s", server.address().port);
  });
  function function2() {
    console.log('OK');
}
