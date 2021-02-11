define(['js/views/validation',
    'gettext',
    'edx-ui-toolkit/js/utils/string-utils',
    'edx-ui-toolkit/js/utils/html-utils',
    'underscore',
    'jquery'],
    function(ValidatingView, gettext, StringUtils, HtmlUtils, _, $) {
        var TeamSetView = ValidatingView.extend({
    // Model class is CMS.Models.Settings.CourseGrader
            events: {
                'input input': 'updateModel',
                'input textarea': 'updateModel',
        // Leaving change in as fallback for older browsers
                'change input': 'updateModel',
                'change textarea': 'updateModel',
                'click .remove-grading-data': 'deleteModel',
        // would love to move to a general superclass, but event hashes don't inherit in backbone :-(
                'focus :input': 'inputFocus',
                'blur :input': 'inputUnfocus'
            },
            initialize: function() {
                this.listenTo(this.model, 'invalid', this.handleValidationError);
                this.selectorToField = _.invert(this.fieldToSelectorMap);
                this.render();
            },

            render: function() {
                return this;
            },
            fieldToSelectorMap: {
                id: 'course-teams-configuration-teamset-id',
                name: 'course-teams-configuration-teamset-name',
                description: 'course-teams-configuration-teamset-description',
            	type: 'course-teams-configuration-teamset-type',
                max_team_size: 'course-teams-configuration-teamset-max'
            },
            updateModel: function(event) {
        // HACK to fix model sometimes losing its pointer to the collection [I think I fixed this but leaving
        // this in out of paranoia. If this error ever happens, the user will get a warning that they cannot
        // give 2 assignments the same name.]
                if (!this.model.collection) {
                    this.model.collection = this.collection;
                }

                switch (event.currentTarget.id) {
                case 'course-teams-configuration-teamset-id':
            // Keep the original name, until we save
                    this.oldName = this.oldName === undefined ? this.model.get('id') : this.oldName;
            // If the name has changed, alert the user to change all subsection names.
                    if (this.setField(event) != this.oldName && !_.isEmpty(this.oldName)) {
                // overload the error display logic
                        this._cacheValidationErrors.push(event.currentTarget);
                        var message = StringUtils.interpolate(
                    gettext('Any existing team assignments assigned to team set {oldName} must be manually reassigned to {newName} or they will not work correctly.'),
                            {
                                oldName: this.oldName,
                                newName: this.model.get('id')
                            }
                );
                        HtmlUtils.append($(event.currentTarget).parent(), this.errorTemplate({message: message}));
                    }
                    break;
                default:
                    this.setField(event);
                    break;
                }
            },
            deleteModel: function(e) {
                e.preventDefault();
                this.collection.remove(this.model);
            }
        });

        return TeamSetView;
    }); // end define()
