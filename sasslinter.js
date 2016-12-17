var lint = require('sass-lint');

var results = lint.lintFiles('', {}, '.sass-lint.yml');
var hr = '--------------------------------------------------------------------';
var result = '';
var file = '';
var messages = '';
var message = '';
var location = '';
var output = '';
var msg = '';
var rule = '';
var line = '';
var col = '';
var len = 0;

for (var i = 0; i < results.length; i++) {
    result = results[i];
    file = result.filePath;
    messages = result.messages;
    if (messages.length > 0) {
        console.log(hr);
        console.log(file);
        for (var j = 0; j < messages.length; j++) {
            message = messages[j];
            msg = message.message;
            rule = ' (Property Sort)';
            if (message.ruleId != 'property-sort-order') {
                rule = ' (' + message.ruleId + ')';
            }
            line = message.line + '';
            col = message.column + '';

            if (line.length == 1) {
                line = '   ' + line;
            } else if (line.length == 2) {
                line = '  ' + line;
            } else if (line.length == 3) {
                line = ' ' + line;
            }

            if (col.length == 1) {
                col =  col + '  ';
            } else if (col.length == 2) {
                col =  col + ' ';
            }

            len = 48 - msg.length;
            if (len > 0) {
                msg = msg + new Array(len + 1).join(' ');
            }

            location = line + ':' + col + ' ';
            output = location + msg + rule;
            console.log(output);
        }
    }
}