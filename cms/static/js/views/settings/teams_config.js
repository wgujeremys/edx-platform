define(['js/views/validation',
    'underscore',
    'jquery',
    'jquery.ui',
    'js/views/settings/team_set',
    'edx-ui-toolkit/js/utils/string-utils',
    'edx-ui-toolkit/js/utils/html-utils'
],
    function(ValidatingView, _, $, ui, TeamSetView, StringUtils, HtmlUtils) {
        var TeamsConfigView = ValidatingView.extend({
    // Model class is CMS.Models.Settings.CourseGradingPolicy
            events: {
                'input input': 'updateModel',
                'input textarea': 'updateModel',
        // Leaving change in as fallback for older browsers
                'change input': 'updateModel',
                'change textarea': 'updateModel',
                'input span[contenteditable=true]': 'updateDesignation',
                'click .settings-extra header': 'showSettingsExtras',
                'click .remove-button': 'removeGrade',
                'click .add-team-set': 'addAssignmentType',
        // would love to move to a general superclass, but event hashes don't inherit in backbone :-(
                'focus :input': 'inputFocus',
                'blur :input': 'inputUnfocus'
            },
            initialize: function() {
        //  load template for grading view
                var self = this;
                this.template = HtmlUtils.template(
            		$('#teamset-tpl').text()
        		);
                this.listenTo(this.model, 'invalid', this.handleValidationError);
                this.listenTo(this.model, 'change', this.showNotificationBar);
                this.model.get('team_sets').on('reset', this.render, this);
                this.model.get('team_sets').on('add', this.render, this);
                this.selectorToField = _.invert(this.fieldToSelectorMap);
                this.render();
            },

            render: function() {
                this.clearValidationErrors();

                this.renderMinimumGradeCredit();

        // Create and render the grading type subs
                var self = this;
                var gradelist = this.$el.find('.course-teams-configuration-list');
        // Undo the double invocation error. At some point, fix the double invocation
                $(gradelist).empty();
                var gradeCollection = this.model.get('team_sets');
        // We need to bind these events here (rather than in
        // initialize), or else we can only press the delete button
        // once due to the graders collection changing when we cancel
        // our changes.
                _.each(['change', 'remove', 'add'],
               function(event) {
                   gradeCollection.on(event, function() {
                       this.showNotificationBar();
                       // Since the change event gets fired every time
                       // we type in an input field, we don't need to
                       // (and really shouldn't) rerender the whole view.
                       if (event !== 'change') {
                           this.render();
                       }
                   }, this);
               },
               this);
                gradeCollection.each(function(gradeModel) {
                    var rendered = self.template({model: gradeModel});
                    HtmlUtils.append(gradelist, rendered);
                    var newEle = gradelist.children().last();
                    var newView = new TeamSetView({el: newEle,
                        model: gradeModel, collection: gradeCollection});
            // Listen in order to rerender when the 'cancel' button is
            // pressed
                    self.listenTo(newView, 'revert', _.bind(self.render, self));
                });


                return this;
            },
            addAssignmentType: function(e) {
                e.preventDefault();
                this.model.get('team_sets').push({});
            },
            fieldToSelectorMap: {
                max_team_size: 'course-teams-max-team-size'
            },
            renderMinimumGradeCredit: function() {
                var minimum_grade_credit = this.model.get('max_team_size');
                this.$el.find('#course-teams-max-team-size').val(
            Math.round(parseFloat(minimum_grade_credit))
        );
            },
            setMinimumGradeCredit: function(event) {
                this.clearValidationErrors();
        // get field value in float
                var newVal = $(event.currentTarget).val();
                this.model.set('max_team_size', newVal, {validate: true});
            },
            updateModel: function(event) {
                if (!this.selectorToField[event.currentTarget.id]) return;

                switch (this.selectorToField[event.currentTarget.id]) {
                case 'max_team_size':
                    this.setMinimumGradeCredit(event);
                    break;

                default:
                    this.setField(event);
                    break;
                }
            },

            showSettingsExtras: function(event) {
                $(event.currentTarget).toggleClass('active');
                $(event.currentTarget).siblings.toggleClass('is-shown');
            },


            revertView: function() {
                var self = this;
                this.model.fetch({
                    success: function() {
                        self.render();
                    },
                    reset: true,
                    silent: true});
            },
            showNotificationBar: function() {
        // We always call showNotificationBar with the same args, just
        // delegate to superclass
                ValidatingView.prototype.showNotificationBar.call(this,
                                                          this.save_message,
                                                          _.bind(this.saveView, this),
                                                          _.bind(this.revertView, this));
            }
        });

        return TeamsConfigView;
    }); // end define()
