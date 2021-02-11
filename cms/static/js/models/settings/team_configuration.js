/* globals _ */
define(['backbone', 'js/models/location', 'js/collections/team_set', 'edx-ui-toolkit/js/utils/string-utils'],
    function(Backbone, Location, TeamSetCollection, StringUtils) {
        'use strict';
        var TeamConfiguration = Backbone.Model.extend({
            defaults: {
                team_sets: null,  // TeamSetCollection
                max_team_size: null // either null or percentage
            },
            parse: function(attributes) {
                if (attributes.team_sets) {
                    var graderCollection;
            // interesting race condition: if {parse:true} when newing, then parse called before .attributes created
                    if (this.attributes && this.has('team_sets')) {
                        graderCollection = this.get('team_sets');
                        graderCollection.reset(attributes.team_sets, {parse: true});
                    } else {
                        graderCollection = new TeamSetCollection(attributes.team_sets, {parse: true});
                    }
                    attributes.team_sets = graderCollection;
                }
                return attributes;
            },
            parseMaxTeamSize: function(max_team_size) {
        // get the value of minimum grade credit value in percentage
                if (isNaN(max_team_size)) {
                    return 0;
                }
                return parseInt(max_team_size);
            }
        });

        return TeamConfiguration;
    }); // end define()
