function forceInit() {
    force.init(config);
};

function forceLogin(key) {
    forceInit();
    force.login(function(success) {
        var oauth = force.getOauth();
        setupLightning();
        document.getElementById('login').style.display="none";
        document.getElementById('setup1').style.display="";
    });
}

var _lightningReady = false;

function setupLightning(callback) {
    var appName = config.loApp;
    var oauth = force.getOauth();
    if (!oauth) {
        alert("Please login to Salesforce.com first!");
        return;
    }

    if (_lightningReady) {
        if (typeof callback === "function") {
            callback();
        }
    } else {
        // Transform the URL for Lightning
        var url = oauth.instanceUrl.replace("my.salesforce", "lightning.force");

        $Lightning.use(appName,
            function() {
                _lightningReady = true;
                queryCases();
                if (typeof callback === "function") {
                    callback();
                }
            }, url, oauth.access_token);
    }
}
var myComponent;

function createComponent() {
    setupLightning(function() {
        console.log('+++createComponent ');
        var myComponent = $Lightning.createComponent(
          "szDev:DisplayCase",
          {},
           "lightning-out",
           function(cmp){
           $A.eventService.addHandler({ "event": "szDev:DisplayCaseEvt", "handler" : appEventListener});
           }
        );
    });
}

var howdyHeroku = function(x) {
    alert('heroku js received msg=> ' + x)
};

var putId = function(id) {
    var appEvent = $A.get("e.szDev:DisplayCaseEvt");
    appEvent.setParams({
        "myVal": id,
    });
    appEvent.fire();
};

var appEventListener = function(event){
    var appEventData = event.getParam("myVal");
    var listIds = event.getParam("caseIds");
    console.log('EVENT with Ids RECEIVED!', listIds.length);
    var html = '';
    for (var i = 0; i < listIds.length; i++) {
        var tmpId = listIds[i];
        html += '<li><a href="javascript:putId(\''+ tmpId + '\')">' + tmpId + '</a></li>';
    }
    document.getElementById('caseListevent').innerHTML = html;
};

function queryCases() {
    force.query('SELECT Id FROM Case where isclosed = false LIMIT 10', function(response) {
        var html = '';
        for (var i = 0; i < response.records.length; i++) {
            var tmpId = response.records[i].Id
            html += '<li><a href="javascript:putId(\''+ tmpId + '\')">' + tmpId + '</a></li>';
        }
        document.getElementById('caseList').innerHTML = html;
    });
}

function createComponentServerSide(){
  console.log("createComponentServerSide has been called.");
  var url = config.instanceUrl.replace("my.salesforce", "lightning.force");
  var token = "Bearer "+config.accessToken;
  $Lightning.use(config.loApp, function() {
                 $Lightning.createComponent("c:searchBarInputTextTest",
                 {},
                "lightning-out",
                     function(cmp) {
                        console.log('Created Component with Server Side Oauth');
                        $A.eventService.addHandler({ "event": "c:searchBarInputTextTest", "handler" : appEventListener});
                     });
           },url,token );
}
