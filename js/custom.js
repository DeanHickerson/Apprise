(function($, window, document, undefined) {
    'use strict';
    $(document).ready(function() {

        // declare constants
        var DUPLICATE_CLASS = '.form-duplicate-this';
        var formValid = false;

        // define template for adding new entries
        var source = $("#entry-template").html();
        var template = Handlebars.compile(source);

        // init form validation
        var $form = $('form#msgForm');
        $form.validate({
            rules: {
                empId: {
                    required: true,
                    digits: true
                }
            }
        });

        // init datetimepicker
        $('.dtpicker').datepicker();

        // bind button clicks
        $('.add-more-messages').on('click', addAdditionalMessage);
        $('.remove-last-message').on('click', removeLastMessage);
        $('#submit').on('click', submit);

        // init textarea validation (on page load)
        $('textarea[name=message]').on('input', validateAllTextareas);

        // init log entries
        initializeLogTable();

        // initializes the log table with data from log.json
        function initializeLogTable() {
            console.log("ajax call to get json for log...");
            $.getJSON("log.json", function(data) {
                console.log("call success");
                // var reverseJSON = data.reverse();
                var count = data.length;
                $.each(data, function(i, el) {
                    if (i >= count - 5) {
                        // if (i < 5) {
                        addTableRow(el);
                    }
                })
            }).done(function() {
                console.log("call and loop success");
            }).fail(function() {
                console.log("error");
            }).always(function() {
                console.log("complete");
            });
        };

        // momentjs test code
        var rightNow = moment();
        console.log("CST: " + rightNow.format());
        console.log("EST: " + rightNow.tz("America/New_York").format());

        // Do not cache data
        $.ajaxSetup({
            cache: false
        });
        // Get current Alert Message
        setTimeout(function() {
            $.get('./results.json', function(data) {
                var output = '';
                for(var i = 0; i < data.startDate.length; i++) {
                    output += '<p>' + data.startDate[i] + ' ' + data.startTime[i] + ' ' + data.message[i] + '</p>';
                }
                $('#currentMessage').html(output);
            });
        }, 2000);

        // form submit function
        function submit() {
            $('[name="startTime"]').val() + ' ' + 'EDT';
            var $form = $('#msgForm'),
                isValid = $form.valid();
            console.log("Form is valid? " + isValid);
            if (isValid) {
                var formData = $('#msgForm').serializeObject();
                console.log(formData);
                var postData = JSON.stringify(formData);
                // TODO: this can maybe go away
                var timestamp = moment().unix();
                console.log("Right now is: " + timestamp);
                console.log("Readable EST Timestamp: " + getFormattedDate(timestamp));

                $.ajax({
                    // url: 'functions.php',
                    url: 'endpoint.php',
                    data: {
                        'data': postData
                    },
                    dataType: 'json',
                    type: 'POST',
                    beforeSend: function(xhr) {
                        //xhr.setRequestType('application/json');
                    }
                }).done(function(data) {
                    console.log("success");
                    // console.log(data);

                    // do stuff with our variables
                    addTableRow(data.json);
                }).fail(function(jqXHR) {
                    console.log("fail");
                    // console.log(jqXHR);
                }).always(function(data) {
                    console.log("done");
                    // console.log(data);
                });

            }
        };

        // define table update method
        function addTableRow(jsonData) {
            var $table = $('#return-table');

            // we actually have a table to update
            if ($table.length > 0) {
                console.log("updating table...");
                var $body = $table.find('tbody'),
                    html = template(jsonData);
                $body.append(html);
            }
        };

        $.fn.serializeObject = function() {
            var o = {};
            var a = this.serializeArray();
            $.each(a, function() {
                if (o[this.name] !== undefined) {
                    if (!o[this.name].push) {
                        o[this.name] = [o[this.name]];
                    }
                    o[this.name].push(this.value || '');
                } else {
                    o[this.name] = this.value || '';
                }
            });
            return o;
        };

        /*
         * NEW CODE BELOW
         */

        // checks all "textarea" elements on page, if any are blank, sets "formValid" to false, otherwise to "true"
        function validateAllTextareas() {
            var invalidForm = false;
            var $textAreas = $('textarea');

            // determine if any textareas were blank...
            $.each($textAreas, function(i, el) {
                if (el.value.length <= 0) {
                    // found an invalid/blank textarea while looping, disable addButton later...
                    invalidForm = true;
                }
            });

            // if any textareas were to be invalid, disable the add button
            if (invalidForm) {
                // all existing textareas on page are valid, allow to add more...
                disableAddButton();
                formValid = false;
            } else {
                // else, enable it!
                enableAddButton();
                formValid = true;
            }
        };

        // enables the state of the Add button
        function enableAddButton() {
            enableButton($('span.add-more-messages').parent());
        }

        // disables the state of the Add button
        function disableAddButton() {
            disableButton($('span.add-more-messages').parent());
        }

        // enables the state of the Remove button
        function enableRemoveButton() {
            enableButton($('span.remove-last-message').parent());
        }

        // disables the state of the Remove button
        function disableRemoveButton() {
            disableButton($('span.remove-last-message').parent());
        }

        function enableButton($button) {
            $button.removeClass('disabled');
        }

        function disableButton($button) {
            if (!$button.hasClass('disabled')) {
                $button.addClass('disabled');
            }
        }

        // duplicates existing form "message" groups
        function addAdditionalMessage() {
            if (formValid) {
                var $dup = $(DUPLICATE_CLASS),
                    messageLength = 0; // instantiate at 0

                // clone the first element
                $dup.first().off().clone().appendTo($dup.parent());

                // get how many "textarea"s are on the page at this moment
                messageLength = $('textarea').length;

                // iterate over each group of inputs
                $.each($(DUPLICATE_CLASS), function(i, e) {

                    // if we're on the last element
                    if (i == (messageLength - 1)) {
                        // get the last "message" element
                        var $message = $(e).find('textarea');

                        // reset the message to the placeholder text
                        $message.val('').attr('placeholder', 'e.g. All Enterprise Systems and applications are operational.');

                        // re-bind textarea validation call
                        $message.on('input', validateAllTextareas);
                    }
                });

                // disable add button
                disableAddButton();

                // reset form to invalid
                formValid = false;

                // we're always adding, so we need to enable the remove button...
                enableRemoveButton();
            }
        };

        // removes last form "message" group, unless there's only one left
        function removeLastMessage() {
            var len = $(DUPLICATE_CLASS).length,
                $lastItem = $(DUPLICATE_CLASS + ':last');

            // only remove an item, if there are more than one
            if (len > 1) {
                $lastItem.remove();
                len--;

                // if there's only 1 textarea left after removing the item...
                if (len <= 1) {
                    // ..disable the remove button
                    disableRemoveButton();

                    // and re-validate all existing textareas, to set the "addButton" state
                    validateAllTextareas();
                }
                return;
            }
        };

        // on empid input check if we can add/remove messages
        $('input[name=empId]').on('input', function(e) {
            isFormValid(e);
        });

        // TODO: bind additional listener for COMPLETE form validation

        // determine if we can submit the form (need EmpID, START datetime, and message(s))
        // REQUIRED: EmpID, Start Date, Start Time, and Message
        function isFormValid(e) {
            var $input = $(e.target),
                value = $input.val(),
                $submit = $('#submit'),
                $formButtons = $('.form-button');

            if (value.length == 5) {
                formValid = true;
                $submit.prop('disabled', false);
            } else {
                formValid = false;
                $submit.prop('disabled', true);
            }

            // todo: add other validation
        };

        // converts form input date & time into unix timestamp
        function getTimestamp(formattedDate) {
            // TODO
        };

        // converts unix timestamp to human readable EST date & time
        function getFormattedDate(timestamp) {
            return moment.unix(timestamp).tz('America/New_York').format("MM/DD HH:mm z");
        };

    });
})(jQuery, window, document);
