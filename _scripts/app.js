
//Wait for the document to load and for ugui.js to run before running your app's custom JS
$(document).ready( function () {
    ugui.helpers.loadSettings(runApp);
});

//Container for your app's custom JS
function runApp() {

    //require('nw.gui').Window.get().showDevTools();

    // Set default paths to check based on OS standards
    var path = require('path');

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

    function urlKeyup () {
        var url = cleanURL();
        $("#output").val(url);
        ugui.helpers.saveSettings();
    }
    $("#url").change(urlKeyup);
    $("#url").keyup(urlKeyup);

    function prefillURL () {
        $('#url').val('http://google.com');
        urlKeyup();
    }
    function prefillOutput () {
        var homePath = '';
        if (process.platform == 'linux') {
            homePath = process.env.HOME;
        } else if (process.platform == 'win32') {
            homePath = process.env.USERPROFILE;
        } else if (process.platform == 'darwin') {
            homePath = '/Users/' + process.env.USER;
            if (process.env.HOME) {
                homePath = process.env.HOME;
            }
        }
        var myDesktopPath = path.join(homePath, 'Desktop');
        $('#folderPicker').val(myDesktopPath);
    }
    function prefillData () {
        ugui.helpers.buildUGUIArgObject();
        if (!ugui.args.url.value) {
            prefillURL();
        }
        if (!ugui.args.folderPicker.value) {
            prefillOutput();
        }
    }
    prefillData();

    function successMessage (file, ext) {
        var filetype = ext.toUpperCase();
        if (filetype == 'MARKDOWN') {
            filetype = 'Markdown';
        }
        var message =
            '<div class="col-xs-12">' +
                '<div class="well">' +
                    '<h4 class="text-center">' +
                        '<p>Your <strong>' + filetype + '</strong> file has been saved.</p>' +
                    '</h4>' +
                    '<p>' + file + '</p>' +
                '</div>' +
            '</div>';
        $("#results").html(message);
    }


    $('#outputFolderIcon').click(function () {
        $('#outputFolderBrowse').click();
    });

    $('#outputFolderBrowse').change(function () {
        var userDir = $(this).val();
        $('#folderPicker').val(userDir);
        ugui.helpers.saveSettings();
    });

    if (ugui.args.badgeError.value == 'false') {
        $('#button-badges .btn-danger').addClass('disabled');
    }
    if (ugui.args.badgeWarning.value == 'false') {
        $('#button-badges .btn-warning').addClass('disabled');
    }
    if (ugui.args.badgeNotice.value == 'false') {
        $('#button-badges .btn-primary').addClass('disabled');
    }

    $('#button-badges .btn-danger, #button-badges .btn-warning, #button-badges .btn-primary').click(function () {
        if ($(this).hasClass('disabled')) {
            $(this).removeClass('disabled');
            $(this).val('true');
        } else {
            $(this).addClass('disabled');
            $(this).find('.badge').html('0');
            $(this).val('false');
        }
        ugui.helpers.buildUGUIArgObject();
        ugui.helpers.saveSettings();
    });


    var clipboard = 'console.clear(),window.xhrWorked=!0;var xhr=new XMLHttpRequest,img=document.getElementsByTagName("img"),imgLen=img.length,altLen=0,bigAlt=imgLen,bigImg=imgLen,imgErr=0,imgSizes=0,i=0;if(imgLen<1)console.log("No images found on this page.");else{for(i=0;i<imgLen;i++)if(img[i].getAttribute("alt")){var currentAlt=img[i].getAttribute("alt"),descriptive=confirm("Is this text descriptive:\\n"+currentAlt);descriptive&&altLen++,currentAlt.length>100&&bigAlt--;try{xhr.open("HEAD",img[i].getAttribute("src"),!1),xhr.onreadystatechange=function(){if(4==xhr.readyState)if(200==xhr.status){var a=xhr.getResponseHeader("Content-Length");imgSizes+=parseInt(a),a>102400&&bigImg--}else imgErr++},xhr.send(null)}catch(a){window.xhrWorked=!1}}var image="images";1==imgErr&&(image="image");var altPercent=Math.round(altLen/imgLen*100),under100KB="?",failPercent="?",sizeUnder100="?",loaded="?",KB="?",good="text-success glyphicon-ok",bad="text-danger glyphicon-remove",warn="text-warning glyphicon-ban-circle",altIcon=good,lengthIcon=good,sizeIcon=warn,errorIcon=warn;altPercent<100&&(altIcon=bad),bigAlt>imgLen&&(lengthIcon=bad),imgErr>0&&(errorIcon=bad),bigAlt>0&&xhrWorked&&(sizeIcon=good,bigImg>0&&(sizeIcon=bad),errorIcon=good,sizeUnder100=bigImg,loaded=imgLen-imgErr,KB=Math.round(imgSizes/1024*10)/10,under100KB=Math.round(bigImg/imgLen*100),failPercent=Math.round((imgLen-imgErr)/imgLen*100)),console.clear();var html=[\'<div class="row">\\r\\n\',\'  <div class="panel panel-primary">\\r\\n\',\'    <div class="panel-heading">Image Accessibility</div>\\r\\n\',\'    <div class="panel-body">\\r\\n\',\'      <p><i class="glyphicon \'+altIcon+\'"></i> <strong>\'+altPercent+"%</strong> of images on the page had descriptive ALT text. <strong>("+altLen+"/"+imgLen+")</strong></p>\\r\\n",\'      <p><i class="glyphicon \'+lengthIcon+\'"></i> <strong>\'+Math.round(bigAlt/imgLen*100)+"%</strong> of ALTs were under 100 characters. <strong>("+bigAlt+"/"+imgLen+")</strong></p>\\r\\n",\'      <p><i class="glyphicon \'+sizeIcon+\'"></i> <strong>\'+under100KB+"%</strong> of images were under 100KB in size. <strong>("+sizeUnder100+"/"+imgLen+")</strong></p>\\r\\n",\'      <p><i class="glyphicon \'+errorIcon+\'"></i> <strong>\'+failPercent+"%</strong> of images loaded with a total image payload of <strong>"+KB+"KB ("+loaded+"/"+imgLen+")</strong></p>\\r\\n","    </div>\\r\\n","  </div>\\r\\n","</div>"],output="";for(i=0;i<html.length;i++)output+=html[i];console.log(output);var dummy=document.createElement("textarea");dummy.setAttribute("id","dummy"),document.body.appendChild(dummy);var dumNode=document.getElementById("dummy");dumNode.value=output,dumNode.select(),document.execCommand("copy"),document.body.removeChild(dumNode),console.log("The above code has been copied to your clipboard")}';
    $('#clipboard').click(function () {
        var dummy = document.createElement("textarea");
        dummy.setAttribute("id", "dummy");
        document.body.appendChild(dummy);
        var dumNode = document.getElementById("dummy")
        dumNode.value = clipboard;
        dumNode.select();
        document.execCommand("copy");
        document.body.removeChild(dumNode);
    });

    $("#run").click(function (evt) {
        evt.preventDefault();
        $("#results").empty();
        $('#button-badges .badge').html('0');
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
        } else if (ugui.args.outputxml.htmlticked) {
            filetype = "xml";
            ext = ".xml";
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

        var ignore = [];
        if ($('#button-badges .btn-danger').hasClass('disabled')) {
            ignore.push('error');
        }
        if ($('#button-badges .btn-warning').hasClass('disabled')) {
            ignore.push('warning');
        }
        if ($('#button-badges .btn-primary').hasClass('disabled')) {
            ignore.push('notice');
        }

        var url = ugui.args.url.value;
        var folderPicker = ugui.args.folderPicker.value;
        var fileName = ugui.args.output.value;

        var pa11y = require('pa11y');
        var phantomjs = require('phantomjs-prebuilt');

        var test = pa11y({
            'phantomjs': {
                'path': phantomjs.path
            },
            'allowedStandards': [standard],
            'standard': standard,
            'reporter': filetype,
            'ignore': ignore
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

            // Badges
            var badges = {
                'warnings': 0,
                'notices': 0,
                'errors': 0
            };
            for (var i = 0; i < results.length; i++) {
                var theType = results[i].type;
                if (theType == "warning") {
                    badges.warning = badges.warnings + 1;
                } else if (theType == "error") {
                    badges.errors = badges.errors + 1;
                } else if (theType == "notice") {
                    badges.notices = badges.notices + 1;
                }
            }
            $("#button-row .btn-danger span").text(badges.errors);
            $("#button-row .btn-warning span").text(badges.warning);
            $("#button-row .btn-primary span").text(badges.notices);

            // JSON
            if (ugui.args.outputjson.htmlticked) {
                var output = {};
                output.results = results;
                output = JSON.stringify(output, null, 2);
                var file = path.join(folderPicker, fileName + ext);
                ugui.helpers.writeToFile(file, output);
                $("#results").html(successMessage(file, filetype));
            }

            // CSV
            if (ugui.args.outputcsv.htmlticked) {
                var json2csv = require('json2csv');
                var fields = [];
                for (var key in results[0]) {
                    fields.push(key);
                }
                var output = json2csv({
                    'data': results,
                    'fields': fields
                });

                var file = path.join(folderPicker, fileName + ext);
                ugui.helpers.writeToFile(file, output);

                successMessage(file, filetype);
            }

            // Markdown
            if (ugui.args.outputmd.htmlticked) {
                var output = '';
                var hr = '\n* * *\n\n';
                for (var i = 0; i < results.length; i++) {
                    var current = results[i];
                    var code = '**Code:** ' + current.code + '  \n';
                    var type = '**Type:** ' + current.type + '  \n';
                    var typeCode = '**Type Code:** ' + current.typeCode + '  \n';
                    var message = '**Message:** ' + current.message + '  \n';
                    var selector = '**Selector:** `' + current.selector + '`  \n';
                    var context = '**Context:**\n```\n' + current.context + '\n```\n';
                    output = output + code + type + typeCode + message + selector + context;
                    if (i < results.length - 1) {
                        output = output + hr;
                    }
                }

                var file = path.join(folderPicker, fileName + ext);
                ugui.helpers.writeToFile(file, output);

                successMessage(file, filetype);
            }

            // XML
            if (ugui.args.outputxml.htmlticked) {
                var output = '<?xml version="1.0" encoding="UTF-8"?>\n<pa11y>\n';
                for (var i = 0; i < results.length; i++) {
                    var current = results[i];
                    var result =
                        '  <result>\n' +
                        '    <code>' + current.code + '</code>\n' +
                        '    <type typecode="' + current.typeCode + '">' + current.type + '</type>\n' +
                        '    <message>' + current.message + '</message>\n' +
                        '    <selector><![CDATA[' + current.selector + ']]></selector>\n' +
                        '    <context><![CDATA[' + current.context + ']]></context>\n' +
                        '  </result>\n';
                    output = output + result;
                }
                output = output + '</pa11y>\n';

                var file = path.join(folderPicker, fileName + ext);
                ugui.helpers.writeToFile(file, output);

                successMessage(file, filetype);
            }

            // HTML
            if (ugui.args.outputhtml.htmlticked) {
                for (var i = 0; i < results.length; i++) {
                    var theType = results[i].type;
                    var panelColor = "default";
                    if (theType == "warning") {
                        panelColor = "warning";
                    } else if (theType == "error") {
                        panelColor = "danger";
                    } else if (theType == "notice") {
                        panelColor = "primary";
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

                $.get('_markup/template.html', function (data) {
                    var results = $("#results").html();
                    var buttons = $("#button-badges").html();
                    var imgAlts = $("#imagealts").val();
                    var output = data + url + '</h1>\n<span id="buttons">' + buttons + '</span>\n</div>\n' + imgAlts + '\n<div class="row">' + results + "</div>\n</div>\n</body>\n</html>";
                    var file = path.join(folderPicker, fileName + ext);
                    ugui.helpers.writeToFile(file, output);
                });
            }
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
