
//Wait for the document to load and for ugui.js to run before running your app's custom JS
$(document).ready( runApp );

//Container for your app's custom JS
function runApp() {

    ugui.helpers.loadSettings();
    //require('nw.gui').Window.get().showDevTools();

    var correctSlash = "/";
    if ( process.platform == "win32" ) {
        correctSlash = "\\";
    }

    function cleanURL () {
        var url = $("#url").val();
        url = url.replace("https://", "");
        url = url.replace("http://",  "");
        url = url.replace("www.",     "");
        url = url.replace(".html",    "");
        url = url.replace(".htm",     "");
        url = url.replace(".php",     "");
        url = url.replace(".aspx",    "");
        url = url.replace(".asp",     "");
        url = url.replace(".cfm",     "");
        url = url.split(".").join(" ");
        url = url.split("/").join(" ");
        url = url.split("?").join(" ");
        url = url.split("&").join(" ");
        url = url.split("|").join(" ");
        url = url.split("=").join(" ");
        url = url.split("*").join(" ");
        url = url.split("\\").join(" ");
        url = url.split('"').join(" ");
        url = url.split(":").join(" ");
        url = url.split("<").join(" ");
        url = url.split(">").join(" ");
        return url;
    }

    $("#url").change(function () {
        var url = cleanURL();
        $("#output").val(url);
    });
    $("#url").keyup(function () {
        var url = cleanURL();
        $("#output").val(url);
    });

    $("#run").click(function (event) {
        event.preventDefault();
        ugui.helpers.buildUGUIArgObject();

        var filetype = "html";
        var ext = ".html";
        if (ugui.args.outputcsv.htmlticked) {
            filetype = "csv";
            ext = ".csv";
        } else if (ugui.args.outputhtml.htmlticked) {
            filetype = "html";
            ext = ".html";
        } else if (ugui.args.outputjson.htmlticked) {
            filetype = "json";
            ext = ".json";
        } else if (ugui.args.outputmd.htmlticked) {
            filetype = "markdown";
            ext = ".md";
        }

        var standard = "WCAG2AA";
        if (ugui.args.standardsection.htmlticked) {
            standard = "Section508";
        } else if (ugui.args.standardwcaga.htmlticked) {
            standard = "WCAG2A";
        } else if (ugui.args.standardwcagaa.htmlticked) {
            standard = "WCAG2AA";
        } else if (ugui.args.standardwcagaaa.htmlticked) {
            standard = "WCAG2AAA";
        }

        var url = ugui.args.url.value;
        var folderPicker = ugui.args.folderPicker.value;
        var fileName = ugui.args.output.value;
        var exandargs = "pa11y -r " + filetype + " -s " + standard + " " + url;

        var pa11y = require('pa11y');
        var phantomjs = require('phantomjs');

        var test = pa11y({
            'phantomjs': {
                'path': "node_modules\\phantomjs"
            },
            'allowedStandards': [standard],
            ignore: [ 'notice' ]
        });

        test.run(url, function (error, results) {
            if (error) {
                if (error.path = "phantomjs") {
                    console.info("PhantomJS must be installed globally.");
                    console.info("Install Node, from nodejs.org");
                    console.info("Then run: npm install -g phantomjs");
                    console.error(error);
                    $.get("_markup/phantomjs-missing.htm", function (markup) {
                        $("body").prepend( markup );
                        ugui.helpers.openDefaultBrowser();
                    });
                } else {
                    console.info("Failed to return data from the page you entered.");
                    console.error(error.message);
                }
                return;
            }
            $("#results").empty();
            var warn = 0;
            var noti = 0;
            var erro = 0;
            for (var i = 0; i < results.length; i++) {
                var theType = results[i].type;
                var panelColor = "default";
                if (theType == "warning") {
                    panelColor = "warning";
                    warn = warn + 1;
                } else if (theType == "error") {
                    panelColor = "danger";
                    erro = erro + 1;
                } else if (theType == "notice") {
                    panelColor = "primary";
                    noti = noti + 1;
                }

                var theContext = results[i].context;
                theContext = theContext.split("<").join("&lt;");

                var entry =
                  '<div class="panel panel-' + panelColor + '">\n' +
                    '<div class="panel-heading">' + results[i].code + '</div>\n' +
                    '<div class="panel-body">\n' +
                      '<strong class="text-capitalize">' + results[i].type + ':</strong> ' + results[i].message + '<br /><br />\n' +
                      '<pre><code>' + theContext + '</code></pre><br />\n' +
                    '</div>\n' +
                    '<div class="panel-footer text-sm"><h4><small>' + results[i].selector + '</small></h4></div>\n' +
                  '</div>\n';
                if (theType == "error") {
                    $("#results").prepend(entry);
                } else {
                    $("#results").append(entry);
                }
            }
            $("#button-row .btn-danger span").text(erro);
            $("#button-row .btn-warning span").text(warn);
            $("#button-row .btn-primary span").text(noti);

            $.get('_markup/template.html', function (data) {
                var results = $("#results").html();
                var buttons = $("#button-badges").html();
                var output = data + url + '</h1><span id="buttons">' + buttons + '</span></div><div class="row">' + results + "</div></div></body></html>";
                ugui.helpers.writeToFile(folderPicker + correctSlash + fileName + ext, output);
            });
        });
    });


/*
    var argsForm = [];
    argsForm.push( $("#pa11y *[data-argName]") );

    function unlockSubmit() {
        //If a required element wasn't filled out in this form
        if ( $("#pa11y").is(":invalid") ) {
            //Disable/Lock the submit button
            $("#pa11y .sendCmdArgs").prop("disabled", true);
            $("#pa11y .sendCmdArgs").addClass("").removeClass("btn-success");
        //If all required elements in a form have been fulfilled
        } else {
            //Enable/Unlock the submit button
            $("#pa11y .sendCmdArgs").prop("disabled", false);
            $("#pa11y .sendCmdArgs").addClass("btn-success").removeClass("btn-default");
        }
    }

    for (index = 0; index < argsForm.length; index++) {
        //When you click out of a form element
        $(argsForm[index]).keyup  ( unlockSubmit );
        $(argsForm[index]).mouseup( unlockSubmit );
        $(argsForm[index]).change ( unlockSubmit );
    }

    //On page load have this run once to unlock submit if nothing is required.
    unlockSubmit();
*/

}// end runApp();
