#!/usr/bin/node

/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
var config = require("./config");

var teamspeak = new (require("node-teamspeak"))(config.host);
teamspeak.send("login", {client_login_name: config.loginName, client_login_password: config.loginPassword}, function(err, response) {
    teamspeak.send("use", {sid: config.serverId}, function(err, response) {
        teamspeak.send("clientupdate", {client_nickname: config.clientName}, function(err, response) {
            var homeChannelTimes = {};
            (function checkHomeChannel(config) {
                var maxHomeChannelTimes = config.maxSeconds / 2;
                teamspeak.send("clientlist", function(err, response) {
                    for (i in response) {
                        var client = response[i];
                        if (client.client_type === 0) {
                            if (client.cid === config.homeChannelId) {
                                homeChannelTimes[client.client_database_id] = homeChannelTimes[client.client_database_id] ? homeChannelTimes[client.client_database_id] + 1 : 1;
                                if (homeChannelTimes[client.client_database_id] > maxHomeChannelTimes) {
                                    homeChannelTimes[client.client_database_id] = 0;
                                    teamspeak.send("clientpoke", {clid: client.clid, msg: config.pokeMessage});
                                    teamspeak.send("clientmove", {clid: client.clid, cid: config.destinationChannelId});
                                }
                            } else {
                                homeChannelTimes[client.client_database_id] = 0;
                            }
                        }
                    }
                    setTimeout(function() {
                        checkHomeChannel();
                    }, 2000);
                });
            })(config.modules.checkHomeChannel);
        });
    });
});
