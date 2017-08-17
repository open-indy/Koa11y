function tryParseJSON (jsonString) {
        try {
            var obj = JSON.parse(jsonString);
            if (obj && typeof obj === 'object') {
                return obj;
            }
        } catch (err) {
            // eslint-disable-line no-empty
            // If we log the err here it will spam the console anytime the user pastes non-json or types in the box
        }

        return false;
    }

    module.exports = tryParseJSON;
