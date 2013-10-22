#!/usr/bin/node

/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
var config = require("./config");

var teamspeak = new (require("node-teamspeak"))(config.host);
teamspeak.send("login", {client_login_name: config.loginName, client_login_password: config.loginPassword}, function(err, response) {
    teamspeak.send("use", {sid: config.serverId}, function(err, response) {
        teamspeak.send("clientupdate", {client_nickname: config.clientName}, function(err, response) {
            //Add module-dir to the module-paths
            module.paths.push("modules");
            //Execute modules
            for (module in config.modules) {
                require(module)(teamspeak, config.modules[module]);
            }
        });
    });
});
