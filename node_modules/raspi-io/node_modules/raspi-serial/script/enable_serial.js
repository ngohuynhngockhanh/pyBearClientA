#!/usr/bin/env node
/*
The MIT License (MIT)
Copyright (c) 2016 Bryan Hughes <bryan@nebri.us>
Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:
The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.
THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
*/

var fs = require('fs');

console.log('Checking if serial port login is enabled');

var cmdline = '';

try {
  cmdline = fs.readFileSync('/boot/cmdline.txt').toString();
} catch (e) {
  if (e.code == 'ENOENT') {
    console.log('/boot/cmdline.txt does not exist. You may need to disable serial port login manually. See your distribution\'s documentation for more information.');
    process.exit();
  }
}

cmdline = cmdline.split(' ');
var hasEntry = false;
cmdline = cmdline.filter(function(entry) {
  var keep = entry.indexOf('ttyAMA0') === -1;
  if (!keep) {
    hasEntry = true;
  }
  return keep;
});

if (hasEntry) {
  console.log('Disabling serial port login by modifying /boot/cmdline.txt');
  fs.writeFileSync('/boot/cmdline.txt', cmdline.join(' '));
  console.warn('YOU MUST REBOOT YOUR PI BEFORE USING SERIAL!');
} else {
  console.log('Serial port login does not appear to be enabled, skipping');
}
