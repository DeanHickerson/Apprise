!function($,e,t,a){"use strict";$(t).ready(function(){function e(){$("input").each(function(e){"empId"!=$(this).attr("name")&&$(this).val("")}),$("textarea").val(""),$(S).each(function(e){T()}),$("input[name=startDate]").val("1/1/2000"),$("input[name=startTime]").val("1100"),$("textarea").val("All Systems are Clear");var e=$("#msgForm"),t=e.valid();if(t){var a=$("input[name=empId]").val(),o={},i=n("MM/DD/YY HH:mm",!0);o.timestamp=i,H?o.dateWarn="true":o.dateWarn="false",o.msgId=a,o.info=[];var c={};c.startDate=n("MM/DD/YYYY"),c.startTime=n("HHmm"),c.endDate="",c.endTime="",c.message="All Systems Clear",o.info.push(c),$.each(o.info,function(e,t){t.startTime+=" "+N}),console.log(o);var d=JSON.stringify(o);console.log(d),$.ajax({url:"endpoint.php",data:{data:d},dataType:"json",type:"POST"}).done(function(e){console.log("success"),b(),s(),$(".half.two").append('<div class="good"><p>Your message has been sent!</p></div>'),r($(".good"))}).fail(function(e){console.error("fail")}).always(function(e){console.log("done")})}}function t(){return x.isDST?(N="EST",console.log("We are currently on EST")):(N="EDT",console.log("We are currently on EDT")),N}function a(){$.getJSON("dates.json",function(e){$.each(e.regular,function(e,t){if(w===t)return H=!0}),$.each(e.early,function(e,t){if(M===t)return A=!0})})}function n(e,n){var o=moment(),i=moment.tz(k,"America/New_York").format(e);t(),a();var s=i;return n&&(s+=" "+N),s}function o(){$.getJSON("./results.json",function(e){var t="";$.each(e.info,function(e,a){a.startDate=a.startDate.slice(0,-4)+a.startDate.slice(8),(a.endDate||""!==a.endTime)&&(a.endDate=a.endDate.slice(0,-4)+a.endDate.slice(8),a.startTime=a.startTime.slice(0,-4)),t+="<p>"+a.startDate+" ",t+=a.startTime+" ",""!==a.endDate&&(t+="to "+a.endDate),""!==a.endTime&&(t+=" "+a.endTime+" "),t+=a.message+"</p>"}),$("#currentMessage").hide().html(t).fadeIn(300)})}function i(){var e=$("#msgForm"),t=e.valid();if(console.log("Form is valid? "+t),t){var a=$("input[name=empId]").val(),o={},i=n("MM/DD/YY HH:mm",!0);o.timestamp=i,H?o.dateWarn="true":o.dateWarn="false",o.msgId=a,o.info=$(".form-duplicate-this").serializeObject(),$.each(o.info,function(e,t){t.startTime+=" "+N,""!==t.endTime&&(t.endTime+=" "+N)}),console.log(o);var c=JSON.stringify(o);console.log(c),$.ajax({url:"endpoint.php",data:{data:c},dataType:"json",type:"POST"}).done(function(e){console.log("success"),b(),s(),$(".half.two").append('<div class="good"><p>Your message has been sent!</p></div>'),r($(".good"))}).fail(function(e){console.error("fail")}).always(function(e){console.log("done")})}}function s(){setTimeout(function(){o(),y()},2e3)}function r(e){setTimeout(function(){e&&e.fadeOut(2e3)},3e3),c(e)}function c(e){e.click(function(){$(this).stop().fadeOut(200)})}function d(){var e=!1,t=$("textarea");$.each(t,function(t,a){a.value.length<=0&&(e=!0)}),e?(l(),v(),I=!1):(m(),p(),I=!0)}function m(){g($(".add-more-messages"))}function l(){h($(".add-more-messages"))}function u(){g($(".remove-last-message"))}function f(){h($(".remove-last-message"))}function p(){g($("#submit"))}function v(){h($("#submit"))}function g(e){e.removeClass("disabled")}function h(e){e.hasClass("disabled")||e.addClass("disabled")}function D(){if(I){var e=$(S),t=0;e.first().off().clone().appendTo(e.parent()),t=$("textarea").length,$.each($(S),function(e,a){if(e==t-1){var n=$(a).find("textarea");n.val("").attr("placeholder","e.g. All Enterprise Systems and applications are operational."),n.on("input",d)}}),l(),I=!1,u()}}function T(){var e=$(S).length,t=$(S+":last");if(e>1)return t.remove(),e--,void(e<=1&&(f(),d()))}function Y(e){var t=$(e.target),a=t.val(),n=$("#submit"),o=$(".form-button");5==a.length?(I=!0,n.prop("disabled",!1)):(I=!1,n.prop("disabled",!0))}function y(){$.getJSON("./log.json",function(e){e=e.reverse();var t=[],a="";$.each(e,function(e,a){var n=a.msgId,o=a.timestamp;$.each(a.info,function(e,a){a.empId=n,a.timestamp=o,t.push(a)})}),$.each(t,function(e,t){t.startDate=t.startDate.slice(0,-4)+t.startDate.slice(8),(t.endDate||""!=t.endTime)&&(t.endDate=t.endDate.slice(0,-4)+t.endDate.slice(8)),a+="<tr>",a+="<td>"+t.timestamp+"</td>",a+="<td>"+t.empId+"</td>",a+="<td>"+t.startDate+"</td>",a+="<td>"+t.startTime+"</td>",a+="<td>"+t.endDate+"</td>",a+="<td>"+t.endTime+"</td>",a+="<td>"+t.message+"</td>",a+="</tr>"}),$("#return-table tbody").hide().html(a).fadeIn(300)})}function b(){$("input").val(""),$("textarea").val(""),$(S).each(function(e){T()})}$.ajaxSetup({cache:!1});var S=".form-duplicate-this",I=!1,j=$("form#msgForm");j.validate({rules:{empId:{required:!0,digits:!0}}}),$(".dtpicker").datepicker(),$(".add-more-messages").on("click",D),$(".remove-last-message").on("click",T),$("#submit").click(i),$("#allCear").click(e),$("textarea[name=message]").on("input",d);var k=moment(),x=moment.tz(k,"America/New_York").format("MM/DD/YY HH:mm"),M=moment.tz(k,"America/New_York").format("M/D/YYYY"),O=moment().add(1,"days"),w=moment.tz(O,"America/New_York").format("M/D/YYYY"),N;t();var H,A;setTimeout(function(){s()},2e3),$.fn.serializeObject=function(){var e=[];return $(this).each(function(t,a){var n={};$.each($(a).find("input"),function(e,t){var a=$(t).attr("name"),o=$(t).val();n[a]=o}),$.each($(a).find("textarea"),function(e,t){var a=$(t).attr("name"),o=$(t).val();n[a]=o}),e.push(n)}),e},$("input[name=empId]").on("input",function(e){Y(e)})})}(jQuery,window,document);