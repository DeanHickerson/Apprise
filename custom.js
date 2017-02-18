(function($, window, document, undefined) {
    'use strict';
    $(document).ready(function() {

        // Do not cache data
        $.ajaxSetup({
            cache: false
        });

        // declare constants
        var DUPLICATE_CLASS = '.form-duplicate-this';
        var formValid = false;


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
        $('#submit').click(submit);

        // init textarea validation (on page load)
        $('textarea[name=message]').on('input', validateAllTextareas);


        // Time at pageload
        var rightNow = moment();
        var curTime = moment.tz(rightNow,'America/New_York').format("MM/DD/YY HH:mm");
        var date = moment.tz(rightNow,'America/New_York').format("M/D/YYYY");
        var tomorrow = moment().add(1, 'days');
        var tomorrowDate = moment.tz(tomorrow,'America/New_York').format("M/D/YYYY");

        // Check for DST and provide a variable to add to text
        var curDST;
        function zoneCheck(){
            if(curTime.isDST){
                curDST = 'EST';
                console.log('We are currently on EST');
            } else {
                curDST = 'EDT';
                console.log('We are currently on EDT');
            }
            return curDST;
        }
        // Check for DST and create DST variable
        zoneCheck();
        // Lets check for special dates to warn for
        var regular;
        var early;
        function getDates() {
            $.getJSON("dates.json",function(dates){
                $.each(dates.regular,function(i,a){
                    if(tomorrowDate === a){
                        return regular = true;
                    }
                });
                $.each(dates.early,function(i,a){
                    if(date === a){
                        return early = true;
                    }
                });
            });
        }

        // When we are ready we will grab the time
        function getTime() {
            var rightnow = moment();
            var curTime = moment.tz(rightNow,'America/New_York').format("MM/DD/YY HH:mm");
            zoneCheck();
            getDates();
            var timestamp = curTime + ' ' + curDST;
            return timestamp;
        }


        // Get current Alert Message
        setTimeout(function() {
            pageUpdate();
        }, 2000);

        function getCurrentMsg() {
            $.getJSON('./results.json', function(data) {
                var output = '';
                $.each(data.info,function(index,value){
                    value.startDate = value.startDate.slice(0,-4) + value.startDate.slice(8);
                    value.endDate = value.endDate.slice(0,-4) + value.endDate.slice(8);
                    if(value.endDate || value.endTime !== '') {
                        value.startTime = value.startTime.slice(0,-4);
                    }
                    output += '<p>' + value.startDate + ' ';
                    output += value.startTime + ' ';
                    if(value.endDate !== '') {
                        output += 'to ' + value.endDate;
                    }
                    if(value.endTime !== '') {
                        output += ' ' + value.endTime + ' ';
                    }
                    output += value.message + '</p>';
                });
                $('#currentMessage').hide().html(output).fadeIn(300);
            });
        }

        // form submit function
        function submit() {
            var $form = $('#msgForm'),
                isValid = $form.valid();
            console.log("Form is valid? " + isValid);
            if (isValid) {
                var msgId = $('input[name=empId]').val();
                var formData = {};
                var timestamp = getTime();
                formData.timestamp = timestamp;
                if (regular) {
                    formData.dateWarn = "true";
                } else {
                    formData.dateWarn = "false";
                }
                formData.msgId = msgId;
                formData.info = $('.form-duplicate-this').serializeObject();
                $.each(formData.info,function(index,value){
                    value.startTime += ' ' + curDST;
                    if (value.endTime !== '') {
                        value.endTime += ' ' + curDST;
                    }
                });
                console.log(formData);
                var postData = JSON.stringify(formData);
                console.log(postData);
                $.ajax({
                    url: 'endpoint.php',
                    data: {
                        'data': postData
                    },
                    dataType: 'json',
                    type: 'POST',
                }).done(function(data) {
                    console.log("success");
                    // do stuff with our variables
                    clearFields();
                    pageUpdate();
                    $('.half.two').append('<div class="good"><p>Your message has been sent!</p></div>');
                    dismissPlusTimer($('.good'));
                }).fail(function(jqXHR) {
                    console.error("fail");
                    // console.log(jqXHR);
                }).always(function(data) {
                    console.log("done");
                    // console.log(data);
                });

            }
        };

        function pageUpdate() {
            setTimeout(function() {
                getCurrentMsg();
                logRetrieve();
            }, 2000);
        }

        function dismissPlusTimer($notif) {
            setTimeout(function() {
                if($notif) {
                    $notif.fadeOut(2000);
                }
            },3000);
            dismissNotif($notif);
        }

        function dismissNotif($notif) {
            $notif.click(function(){
                $(this).stop().fadeOut(200);
            });
        }

        $.fn.serializeObject = function() {
            var array = [];
            $(this).each(function(index,value) {
                var object = {};
                $.each($(value).find('input'), function(key, value) {
                    var name = $(value).attr('name');
                    var val = $(value).val();
                    object[name] = val;
                });
                $.each($(value).find('textarea'), function(key, value) {
                    var name = $(value).attr('name');
                    var val = $(value).val();
                    object[name] = val;
                });
                array.push(object);
            });
            return array;
        }


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
                disableSubmitButton();
                formValid = false;
            } else {
                // else, enable it!
                enableAddButton();
                enableSubmitButton();
                formValid = true;
            }
        };

        // enables the state of the Add button
        function enableAddButton() {
            enableButton($('.add-more-messages'));
        }

        // disables the state of the Add button
        function disableAddButton() {
            disableButton($('.add-more-messages'));
        }

        // enables the state of the Remove button
        function enableRemoveButton() {
            enableButton($('.remove-last-message'));
        }

        // disables the state of the Remove button
        function disableRemoveButton() {
            disableButton($('.remove-last-message'));
        }

        function enableSubmitButton() {
            enableButton($('#submit'));
        }

        function disableSubmitButton() {
            disableButton($('#submit'));
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


        function logRetrieve() {
            $.getJSON('./log.json', function(data) {
                var logArr = [],
                    table = '';
                $.each(data, function(index, obj) {
                    var id = obj.msgId;
                    var timestamp = obj.timestamp;
                    $.each(obj.info, function(index,subObj) {
                        subObj.empId = id;
                        subObj.timestamp = timestamp;
                        logArr.push(subObj);
                    });
                });
                $.each(logArr, function(index,value) {
                    value.startDate = value.startDate.slice(0,-4) + value.startDate.slice(8);
                    value.endDate = value.endDate.slice(0,-4) + value.endDate.slice(8);
                    table += '<tr>';
                    table += '<td>' + value.timestamp + '</td>';
                    table += '<td>' + value.empId + '</td>';
                    table += '<td>' + value.startDate + '</td>';
                    table += '<td>' + value.startTime + '</td>';
                    table += '<td>' + value.endDate + '</td>';
                    table += '<td>' + value.endTime + '</td>';
                    table += '<td>' + value.message + '</td>';
                    table += '</tr>';
                });
                $('#return-table tbody').hide().html(table).fadeIn(300);
            });
        }

        function clearFields() {
            $('input').val('');
            $('textarea').val('');
            $(DUPLICATE_CLASS).each(function(index){
                removeLastMessage();
            });
        }

    });
})(jQuery, window, document);
