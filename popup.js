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

var submitButton = $("#submit");
var status = $("#status")
var nameListArea = $("#name_list_area");
var nameStartUp = $("#name_start_up");
var nameList = $("#nameList");
nameListArea.hide();

var socket = io.connect("ws://128.205.27.232:4004/");
      socket.on('onconnected', function( data ) {
          console.log( 'Connected successfully to the socket.io server. My server side ID is ' + data.id );
      });
      var players;
      function requestPlay() {

        // players[0].uuid
      }
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
              JSON.parse(rJson.players).forEach(function(item,index) {
                var temp = $("<li class='list-group-item'>").html(item[Object.keys(item)[0]]);
                nameList.append(temp);
                players.push(item);
              });
            }
            break;
        }
      });

submitButton.click(function() {
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
    "action" : "in_lobby"
    }));
  });
