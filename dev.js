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
        var validTime = false;
        var valid = false;


        // init form validation
        var $form = $('form#msgForm');


        // init datetimepicker
        $('.dtpicker').datepicker();

        // bind button clicks
        $('.add-more-messages').on('click', addAdditionalMessage);
        $('.remove-last-message').on('click', removeLastMessage);
        $('#submit').click(submit);
        $('#allClear').click(allClear);
        $('#appendMsg').click(appendMessage);
        $('input[name=empId]').on('focus', function() {
            if ($(this).hasClass('bad')) {
                $(this).removeClass('bad');
            }
        });

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
                curDST = 'EDT';
            } else {
                curDST = 'EST';
            }
            return curDST;
        }
        // Check for DST and create DST variable
        zoneCheck();
        // Lets check for special dates to warn for
        var dates = (function() {
            var dates = {};
            $.getJSON('dates.json', function(data) {
                dates.regular = data.regular;
            });
            return dates;
        })();

        // When we are ready we will grab the time
        function getTime(format,dst) {
            var now = moment();
            var dateTimeNow = moment.tz(now,'America/New_York').format(format);
            zoneCheck();
            var timestamp = dateTimeNow;
            if(dst) {
                timestamp += ' ' + curDST;
            }
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
                    if(value.endDate || value.endTime !== '') {
                        value.endDate = value.endDate.slice(0,-4) + value.endDate.slice(8);
                        value.startTime = value.startTime.slice(0,-4);
                    }
                    output += '<p><span style="font-size: 1.1em;">' + (index + 1) + '. |</span> ' + value.startDate + ' ';
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
                $('#tstamp').hide().html(data.timestamp);
            });
        }

        function allClear() {
            if($('input[name=empId]').val().length == 5) {
                $('input').each(function(index) {
                    if($(this).attr('name') !== 'empId') {
                        $(this).val('');
                    }
                });
                $('textarea').val('');
                $(DUPLICATE_CLASS).each(function(index){
                    removeLastMessage();
                });
                $('input[name=startDate]').val('1/1/2000');
                $('input[name=startTime]').val('1100');
                $('textarea').val('All Systems are Clear');
                var $form = $('#msgForm');
                var msgId = $('input[name=empId]').val();
                var formData = {};
                var timestamp = getTime("MM/DD/YY HH:mm:ss",true);
                $.each(dates.regular,function(i,a){
                    if(tomorrowDate === a){
                        return formData.dateWarn = "true";
                    } else {
                        return formData.dateWarn = "false";
                    }
                });
                formData.timestamp = timestamp;
                formData.msgId = msgId;
                formData.info = [];
                var ok = {};
                ok.startDate = getTime("MM/DD/YYYY");
                ok.startTime = getTime("HHmm");
                ok.endDate = '';
                ok.endTime = '';
                ok.message = "All Systems Clear";
                formData.info.push(ok);
                $.each(formData.info,function(index,value){
                    value.startTime += ' ' + curDST;
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
            } else {
                if (!$('input[name=empId]').hasClass('bad')) {
                    $('input[name=empId]').addClass('bad');
                }
            }
        }

        // form submit function
        function submit() {
            var $form = $('#msgForm');
            var msgId = $('input[name=empId]').val();
            var formData = {};
            var timestamp = getTime("MM/DD/YY HH:mm:ss",true);
            $.each(dates.regular,function(i,a){
                if(tomorrowDate === a){
                    return formData.dateWarn = "true";
                } else {
                    return formData.dateWarn = "false";
                }
            });
            formData.timestamp = timestamp;
            formData.msgId = msgId;
            formData.info = $('.form-duplicate-this').serializeObject();
            $.each(formData.info,function(index,value){
                value.startTime += ' ' + curDST;
                if (value.endTime !== '') {
                    value.endTime += ' ' + curDST;
                }
            });
            validate(formData);
            if(valid) {
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
        }


        function appendMessage() {
            var msgId = $('input[name=empId]').val();
            var formData = {};
            var timestamp = getTime("MM/DD/YY HH:mm:ss",true);
            $.each(dates.regular,function(i,a){
                if(tomorrowDate === a){
                    return formData.dateWarn = "true";
                } else {
                    return formData.dateWarn = "false";
                }
            });
            formData.timestamp = timestamp;
            formData.msgId = msgId;
            formData.info = $('.form-duplicate-this').serializeObject();
            $.each(formData.info,function(index,value){
                value.startTime += ' ' + curDST;
                if (value.endTime !== '') {
                    value.endTime += ' ' + curDST;
                }
            });
            validate(formData);
            if(valid) {
                $.getJSON('results.json', function(data) {
                    var existing = data.info;
                    var appending = formData.info;
                    var newInfo = existing.concat(appending);
                    formData.info = newInfo;
                });
                setTimeout(function() {
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
                },1000);
            }
        }

        function pageUpdate() {
            setTimeout(function() {
                getCurrentMsg();
                logRetrieve();
            }, 2000);
        }

        function dismissPlusTimer($notif) {
            setTimeout(function() {
                if($notif) {
                    $notif.fadeOut(2000, function() {
                        $(this).remove();
                    });
                }
            },3000);
            dismissNotif($notif);
        }

        function dismissNotif($notif) {
            $notif.click(function(){
                $(this).stop().fadeOut(200, function() {
                    $(this).remove();
                });
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
        };


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
                disableAppendButton();
                formValid = false;
            } else {
                // else, enable it!
                enableAddButton();
                enableSubmitButton();
                enableAppendButton();
                formValid = true;
            }
        }

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

        // i/o for submit button
        function enableSubmitButton() {
            enableButton($('#submit'));
        }

        function disableSubmitButton() {
            disableButton($('#submit'));
        }

        // i/o for append message
        function enableAppendButton() {
            enableButton($('#appendMsg'));
        }

        function disableAppendButton() {
            disableButton($('#appendMsg'));
        }

        // i/o for All Clear
        function enableAllClearButton() {
            enableButton($('#allClear'));
        }

        function disableAllClearButton() {
            disableButton($('#allClear'));
        }

        // i/o for remove a message
        function enableRemoveMessageButton() {
            enableButton($('#removeIt'));
        }

        function disableRemoveMessageButton() {
            disableButton($('#removeIt'));
        }

        // core button i/o
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
                $dup.first().off().clone().appendTo($dup.parent()).find('.dtpicker').attr('id','').removeClass('hasDatepicker').datepicker();

                // get how many "textarea"s are on the page at this moment
                messageLength = $('textarea').length;

                // iterate over each group of inputs
                $.each($(DUPLICATE_CLASS), function(i, e) {

                    // if we're on the last element
                    if (i == (messageLength - 1)) {
                        // get the last "message" element
                        var $message = $(e).find('textarea');
                        $(e).find('input').val('');
                        // reset the message to the placeholder text
                        $message.val('').attr('placeholder', 'e.g. All Enterprise Systems and applications are operational.');

                        // re-bind textarea validation call
                        $message.on('input', validateAllTextareas);
                    }
                });
                // bind these new fields with our text prevention
                bindEvents();

                // disable add button
                disableAddButton();
                disableSubmitButton();
                disableAppendButton();

                // reset form to invalid
                formValid = false;

                // we're always adding, so we need to enable the remove button...
                enableRemoveButton();
            }
        }

        // removes last form "message" group, unless there's only one left
        function removeLastMessage() {
            var len = $(DUPLICATE_CLASS).length,
                $lastItem = $(DUPLICATE_CLASS + ':last');

            // only remove an item, if there are more than one
            if (len > 1) {
                $lastItem.remove();
                len--;

                // turn the add button back on after removing a message
                enableAddButton();

                // if there's only 1 textarea left after removing the item...
                if (len <= 1) {
                    // ..disable the remove button
                    disableRemoveButton();
                    enableSubmitButton();

                    // and re-validate all existing textareas, to set the "addButton" state
                    validateAllTextareas();
                }
                return;
            }
        }


        // Lets prevent some input types in our inputs
        bindEvents();
        function bindEvents() {
            $('input[name=empId]').on('keydown', preventAlphaChars);
            $('input[name=startDate]').on('keydown', function(e) {
                if (e.which != 9) {
                    e.preventDefault();
                }

            });
            $('input[name=startDate]').click(addClearButton);
            $('input[name=endDate]').on('keydown', function(e) {
                if (e.which != 9) {
                    e.preventDefault();
                }
            });
            $('input[name=endDate]').click(addClearButton);
            $('input[name=startTime]').on('keydown', preventAlphaChars);
            $('input[name=startTime]').on('keyup', validateTime);
            $('input[name=endTime]').on('keydown', preventAlphaChars);
            $('input[name=endTime]').on('keyup', validateTime);
            $('input[name=empId]').on('keyup', function() {
                if($(this).val().length == 5) {
                    enableAllClearButton();
                    enableRemoveMessageButton();
                } else {
                    disableAllClearButton();
                    disableRemoveMessageButton();
                }
            });
            $('.clear').click(function() {
                $(this).prev().val('');
                $(this).fadeOut(300);
            });
        }

        function addClearButton() {
            var clear = $(this).next();
            $('.ui-datepicker td').click(function() {
                clear.fadeIn(300);
            });
        }

        $('.clear').click(function() {
            $(this).prev().val('');
            $(this).fadeOut(300);
        });

        function preventAlphaChars(event) {
            if(event.which >= 65 && event.which <= 90) {
                event.preventDefault();
            }
            if(event.which >= 106 && event.which <= 111) {
                event.preventDefault();
            }
            if(event.which >= 186 && event.which <= 222) {
                event.preventDefault();
            }
        }

        // lets add some more validation
        function validateTime() {
            var value = $(this).val();
            if(value.length === 4) {
                var hours = value.slice(0,-2);
                var mins = value.slice(2);
                hours = parseInt(hours,10);
                mins = parseInt(mins,10);
                if((hours >= 24) || (mins >= 60)) {
                    if (!$(this).hasClass('bad')) {
                        $(this).addClass('bad');
                    }
                    validTime = false;
                } else {
                    if ($(this).hasClass('bad')) {
                        $(this).removeClass('bad');
                    }
                    validTime = true;
                }
            }
            return validTime;
        }

        function evalDate(d) {
            var date = {};
            date.fullDate = d;
            date.month = date.fullDate.slice(0,-8);
            date.day = date.fullDate.slice(3,-5);
            date.year = date.fullDate.slice(6);
            date.number = date.year + date.month + date.day;
            date.int = parseInt(date.number,10);
            return date;
        }

        function validate(formData) {
            var validId = false;
            var validForm = false;
            function error(err) {
                var output = '<div class="error"><p>' + err + '</p></div>';
                $('.removeMsg').after(output);
                dismissPlusTimer($('.error'));
            }
            if(formData.msgId.length == 5) {
                validId = true;
            }
            $.each(formData.info, function(index,value) {
                var startDate = evalDate(value.startDate);
                var cleanStartTime = value.startTime.slice(0,-4);
                if (value.endDate !== '') {
                    var endDate = evalDate(value.endDate);
                } else {
                    var endDate = startDate.int;
                }
                if(value.startDate === '' || cleanStartTime === '' || value.message === '') {
                    console.log('Missing a required field');
                    error('Missing a required field!');
                    return validForm = false;
                } else if (startDate.int > endDate.int) {
                    console.log('Cannot have a start date greater than the end date!');
                    error('Cannot have a start date greater than the end date!')
                    return validForm = false;
                } else if (value.endDate !== '' && value.endTime === '') {
                    console.log('Need an end time when stating an end date');
                    error('Need an end time when stating an end date!');
                    return validForm = false;
                } else if (value.endTime !== '') {
                    if (value.startDate === value.endDate || value.endDate === '') {
                        var start = value.startTime;
                        start = start.slice(0,-4);
                        start = parseInt(start,10);
                        var end = value.endTime;
                        end = end.slice(0,-4);
                        end = parseInt(end,10);
                        if (start > end) {
                            console.log('time mismatch');
                            error('Cannot have a start time greater than the end time!')
                            return validForm = false;
                        } else {
                            validForm = true;
                        }
                    } else {
                        validForm = true;
                    }
                } else {
                    validForm = true;
                }
            });
            if(validId && validForm && validTime) {
                valid = true;
            } else {
                valid = false;
            }
            return valid;
        }

        $('#removeIt').click(remove);
        $('input[name=removeIt]').on('focus', function() {
            if ($(this).hasClass('bad')) {
                $(this).removeClass('bad');
                $('input[name=removeIt]').attr('placeholder', '');
            }
        });
        function remove() {
            if($('input[name=empId]').val().length === 5) {
                var tstamp = $('#tstamp').html();
                var itmNumValid = false;
                var postData;
                var itmNum = parseInt($('input[name=removeIt]').val(),10) - 1;
                $.getJSON('results.json', function(data) {
                    if(tstamp === data.timestamp) {
                        if(data.info.length > 1) {
                            $.each(data.info, function(index, value) {
                                if(itmNum === index) {
                                    data.info.splice(index,1);
                                    itmNumValid = true;
                                }
                            });
                            if(itmNumValid) {
                                data.timestamp = getTime("MM/DD/YY HH:mm:ss",true);
                                postData = JSON.stringify(data);
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
                                    $('.half.two').append('<div class="good"><p>Your update has been sent!</p></div>');
                                    dismissPlusTimer($('.good'));
                                }).fail(function(jqXHR) {
                                    console.error("fail");
                                    // console.log(jqXHR);
                                }).always(function(data) {
                                    console.log("done");
                                    // console.log(data);
                                });
                            } else {
                                if (!$('input[name=removeIt]').hasClass('bad')) {
                                    $('input[name=removeIt]').addClass('bad')
                                        .val('')
                                        .attr('placeholder','Invalid Number');
                                }
                            }
                        } else {
                            if (!$('input[name=removeIt]').hasClass('bad')) {
                                $('input[name=removeIt]').addClass('bad')
                                    .val('')
                                    .attr('placeholder','Use All Clear');
                            }
                        }
                    } else {
                        console.log('timestamp mismatch!');
                        var ok = confirm("Current message does not match! Click OK to reload the page with the current messages and try again.");
                        if(confirm) {
                            pageUpdate();
                        }

                    }
                });
            } else {
                if (!$('input[name=empId]').hasClass('bad')) {
                    $('input[name=empId]').addClass('bad');
                }
            }
        }


        function logRetrieve() {
            $.getJSON('./log.json', function(data) {
                data = data.reverse();
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
                    if(index < 10) {
                        value.startDate = value.startDate.slice(0,-4) + value.startDate.slice(8);
                        if(value.endDate || value.endTime !== '') {
                            value.endDate = value.endDate.slice(0,-4) + value.endDate.slice(8);
                        }
                        table += '<tr>';
                        table += '<td>' + value.timestamp + '</td>';
                        table += '<td>' + value.empId + '</td>';
                        table += '<td>' + value.startDate + '</td>';
                        table += '<td>' + value.startTime + '</td>';
                        table += '<td>' + value.endDate + '</td>';
                        table += '<td>' + value.endTime + '</td>';
                        table += '<td>' + value.message + '</td>';
                        table += '</tr>';
                    }
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
            valid = false;
            validTime = false;
            disableSubmitButton();
            disableAppendButton();
            disableAllClearButton();
            $('.clear').hide();
        }

    });
})(jQuery, window, document);
