define(['libs/joy-runtime'], function(joy) {
return function(data) {data=joy.o(data);return '\r\n<div class="alert '+joy.e(joy.p(data.type))+'">'+joy.e(joy.p(data.content))+'</div>\r\n';}
});