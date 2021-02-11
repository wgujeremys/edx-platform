define([
    'jquery', 'js/views/settings/teams_config', 'js/models/settings/team_configuration'
], function($, TeamsConfigView, TeamsConfigModel) {
    'use strict';
    return function(courseDetails, gradingUrl) {
        var model, editor;

        $('form :input')
            .focus(function() {
                $('label[for="' + this.id + '"]').addClass('is-focused');
            })
            .blur(function() {
                $('label').removeClass('is-focused');
            });

        model = new TeamsConfigModel(courseDetails, {parse: true});
        model.urlRoot = gradingUrl;
        editor = new TeamsConfigView({
            el: $('.settings-teamsetsss'),
            model: model
        });
        editor.render();
    };
});
