/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
module.exports = function(teamspeak, config) {
    var homeChannelTimes = {};
    var maxHomeChannelTimes = config.maxSeconds / 2;
    (function checkHomeChannel() {
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
    })();
};
