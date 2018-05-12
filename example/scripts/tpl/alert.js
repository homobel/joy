define(['joy-runtime'], function(joy) {
return function(data) {data=joy.o(data);return '\r\n<div style="font-size: '+joy.e(joy.p(data.size))+'px; color: '+joy.e(joy.p(data.color))+';">'+joy.e(joy.p(data.text))+'</div>\r\n';}
});