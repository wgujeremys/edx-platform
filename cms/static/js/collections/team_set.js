define(['backbone', 'js/models/settings/team_set'], function(Backbone, TeamSet) {
    return Backbone.Collection.extend({
        model: TeamSet
    });
});
