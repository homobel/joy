const path = require('path');
const joyDefault = require('../../lib/defaults');

console.log(path.join(__dirname, '../../runtime'));

joyDefault.runtimePath = path.join(__dirname, '../../runtime');
