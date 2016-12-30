var webPage = require('webpage');
var page = webPage.create();
var system = require('system');
var address = '';

if (system.args.length < 2) {
    console.log('No URL passed in.');
    phantom.exit();
} else {
    address = system.args[1];
    page.open(address, function (status) {
        if (status == "success") {
            var data = page.evaluate(function() {
                var src = '';
                var alt = '';
                var output = '[';
                var imgs = document.getElementsByTagName('img');
                for (var i = 0; i < imgs.length; i++) {
                    var img = imgs[i];
                    if (i > 0) {
                        output = output + ', ';
                    }
                    src = img.src.replace('"', '\"');
                    src = img.src.replace("'", "\'");
                    alt = img.alt.replace('"', '\"');
                    alt = img.alt.replace("'", "\'");
                    output = output + '{ "src": "' + src + '", "alt": "' + alt + '" }';
                }
                output = output + ']';

                return output;
            });
            console.log(data);
            phantom.exit();
        }
    });
}
