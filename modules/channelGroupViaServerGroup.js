/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
module.exports = function(teamspeak, config) {
    (function channelGroupViaServerGroup() {
        teamspeak.send("channelgroupclientlist", {cgid: config.accessChannelGroupId}, function(err, response) {
            if (!response) {
                response = [];
            } else if (!Array.isArray(response)) {
                response = [response];
            }
            var clientChannelAccessList = {};
            for (i in response) {
                var cldbid = response[i].cldbid;
                var cid = response[i].cid;
                if (!clientChannelAccessList[cldbid]) {
                    clientChannelAccessList[cldbid] = {};
                }
                clientChannelAccessList[cldbid][cid] = true;
            }
            for (serverGroupId in config.channels) {
                teamspeak.send("servergroupclientlist", {sgid: serverGroupId}, function(err, response) {
                    if (!response) {
                        response = [];
                    } else if (!Array.isArray(response)) {
                        response = [response];
                    }
                    var channels = config.channels[serverGroupId];
                    for (i in response) {
                        var cldbid = response[i].cldbid;
                        for (o in channels) {
                            var cid = channels[o];
                            if ((accessTmp = clientChannelAccessList[cldbid]) && (access = accessTmp[cid])) {
                                if (access !== null) {
                                    clientChannelAccessList[cldbid][cid] = null;
                                }
                            } else {
                                teamspeak.send("setclientchannelgroup", {
                                    "cgid":   config.accessChannelGroupId,
                                    "cid":    cid,
                                    "cldbid": cldbid
                                });
                            }
                        }
                    }
                    //Reset all left ChannelGroups
                    for (cldbid in clientChannelAccessList) {
                        var channelIds = clientChannelAccessList[cldbid];
                        for (cid in channelIds) {
                            if (channelIds[cid] !== null) {
                                teamspeak.send("setclientchannelgroup", {
                                    "cgid":   config.resetChannelGroupId,
                                    "cid":    cid,
                                    "cldbid": cldbid
                                });
                            }
                        }
                    }
                    setTimeout(function() {
                        channelGroupViaServerGroup();
                    }, config.updateInterval);
                });
            }
        });
    })();
};
