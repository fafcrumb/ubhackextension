// Copyright (c) 2014 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

/**
 * Get the current URL.
 *
 * @param {function(string)} callback - called when the URL of the current tab
 *   is found.
 */
function getCurrentTabUrl(callback) {
  // Query filter to be passed to chrome.tabs.query - see
  // https://developer.chrome.com/extensions/tabs#method-query
  var queryInfo = {
    active: true,
    currentWindow: true
  };

  chrome.tabs.query(queryInfo, function(tabs) {
    // chrome.tabs.query invokes the callback with a list of tabs that match the
    // query. When the popup is opened, there is certainly a window and at least
    // one tab, so we can safely assume that |tabs| is a non-empty array.
    // A window can only have one active tab at a time, so the array consists of
    // exactly one tab.
    var tab = tabs[0];

    // A tab is a plain object that provides information about the tab.
    // See https://developer.chrome.com/extensions/tabs#type-Tab
    var url = tab.url;

    // tab.url is only available if the "activeTab" permission is declared.
    // If you want to see the URL of other tabs (e.g. after removing active:true
    // from |queryInfo|), then the "tabs" permission is required to see their
    // "url" properties.
    console.assert(typeof url == 'string', 'tab.url should be a string');

    callback(url);
  });
}

function renderStatus(statusText) {
  document.getElementById('status').textContent = statusText;
}

var status = $("#status")
var nameListArea = $("#name_list_area");
var waitingArea = $("#waiting_area");
var playRequestArea = $("#play_request_area");
var nameStartUp = $("#name_start_up");
var nameList = $("#nameList");

var game_uuid = "",
    from_uuid = "";
var socket = io.connect("ws://128.205.27.232:4004/");
      socket.on('onconnected', function( data ) {
          console.log( 'Connected successfully to the socket.io server. My server side ID is ' + data.id );
      });
      var players;
      var player = {};

      socket.on('playerInfo', function(data) {
        console.log( 'data recieved: ' + data );
        var rJson = JSON.parse(data);
        console.log(data);
        switch(rJson.action) {
          case "create_player":
            player.uuid = rJson.uuid;
            break;
          case "in_lobby":
            if(rJson.players != null) {
              nameListArea.show();
              players = [];
              nameList.empty();
              JSON.parse(rJson.players).forEach(function(item,index) {
                var temp = $("<li class='list-group-item' data-key=" + Object.keys(item)[0] + ">").html(item[Object.keys(item)[0]]);
                nameList.append(temp);
                players.push(item);
              });
            }
          break;
        case "request_to_play_player":
            game_uuid = rJson.game_uuid;
            from_uuid = rJson.from_uuid;
            recieveGameRequest();
          break;
        }
      });

function submitName() {
  player.name=$("#name_input").val();
  socket.emit("playerInfo", JSON.stringify({
    "action" : "create_player",
    "name" : player.name,
    "uuid" : player.uuid
  }));
  $("#name_area").text(player.name);
  console.log(player.name);
  nameStartUp.hide();
  socket.emit("playerInfo",JSON.stringify({
    "action" : "in_lobby",
    "uuid" : player.uuid
    }));
  localStorage.setItem(KEY_ME, JSON.stringify(player));
}

var KEY_ME = "ME_KEY_DO_DEE";
function isLoaded() {
  if(localStorage.getItem(KEY_ME) != null) {
    return true;
  }
  return false;
}

function requestGame(listItemKey){
  hideAllAreas();
  waitingArea.show();
  socket.emit("playerInfo", JSON.stringify({
    "action" : "request_to_play_player",
    "to_uuid" : listItemKey
  }));
}

function recieveGameRequest(){
  hideAllAreas();
  playRequestArea.show();
}

function acceptPlayRequest(){
  socket.emit("playerInfo", JSON.stringify({
    "action" : "response_to_play_player",
    "game_uuid" : game_uuid,
    "status" : "accept"
  }))
}

function hideAllAreas(){
  nameListArea.hide();
  waitingArea.hide();
  nameStartUp.hide();
  playRequestArea.hide();
}

// === Listeners ===

$('#name_input').keydown(function(e){
  if(e.keyCode == 13){
    submitName();
  }
})

$('#submit').click(function() {
  submitName();
});

$(document).on("click", ".list-group-item", function(){
  console.log("hi")
  var listItemKey = $(this).data("key")
  requestGame(listItemKey);
});

$('#play_button').click(function(){
  acceptPlayRequest();
});

$('#deny_button').click(function(){
  socket.emit("playerInfo",JSON.stringify({
    "action" : "response_to_play_player",
    "game_uuid" : game_uuid,
    "status" : "denied"
  }));
});


$(document).ready(function(){
  console.log("LOADED");
  if(isLoaded()) {
    player = JSON.parse(localStorage.getItem(KEY_ME));
    nameStartUp.hide();
    socket.emit("playerInfo",JSON.stringify({
      "action" : "in_lobby",
      "uuid" : player.uuid
      }));
    $("#name_area").text(player.name);
  }
});