define(['backbone', 'underscore', 'gettext'], function(Backbone, _, gettext) {
    var VALID_TEAM_SET_TYPES = ['open', 'private_managed', 'public_managed'];
    var TeamSet = Backbone.Model.extend({
        defaults: {
            id: '',
            name: '',
            description: '',
            type: '',    // must be unique w/in collection (ie. w/in course)
            max_team_size: null
        },
        parse: function(attrs) {
            // round off values while converting them to integer
            if (attrs.max_team_size) {
                attrs.max_team_size = Math.round(attrs.max_team_size);
            }
            return attrs;
        },
        validate: function(attrs) {
            var errors = {};
            if (_.isEmpty(attrs.id)) {
                errors.id = gettext('The team set must have an id.');
            } else {
                var existing = this.collection && this.collection.some(function(other) { return (other.cid != this.cid) && (other.get('id') == attrs.id); }, this);
                if (existing) {
                    errors.id = gettext("There's already another team set with this id.");
                }
            }
            if (_.isEmpty(attrs.name)) {
                errors.name = gettext('The team set must have a display name.');
            }
            if (_.isEmpty(attrs.description)) {
                errors.description = gettext('The team set must have a description.');
            }

            if (_.isEmpty(attrs.type)) {
                errors.type = gettext('The team set must have a type.');
            } else if (!_.contains(VALID_TEAM_SET_TYPES, attrs.type)) {
                errors.type = gettext('Invalid team set type: ') + attrs.type;
            }

            if (_.has(attrs, 'max_team_size')) {
                var intWeight = Math.round(attrs.max_team_size); // see if this ensures value saved is int
                if (!isFinite(intWeight) || /\D+/.test(attrs.max_team_size) || intWeight <= 0 || intWeight > 500) {
                    errors.max_team_size = gettext('Please enter an integer between 1 and 500.');
                } else {
                    attrs.max_team_size = intWeight;
                }
            }
            if (!_.isEmpty(errors)) return errors;
        }
    });

    return TeamSet;
}); // end define()
