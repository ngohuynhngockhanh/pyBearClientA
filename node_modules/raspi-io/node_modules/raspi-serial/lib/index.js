'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Serial = exports.DEFAULT_PORT = exports.PARITY_SPACE = exports.PARITY_MARK = exports.PARITY_ODD = exports.PARITY_EVEN = exports.PARITY_NONE = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _raspiPeripheral = require('raspi-peripheral');

var _serialport = require('serialport');

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; } /*
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

var PARITY_NONE = exports.PARITY_NONE = 'none';
var PARITY_EVEN = exports.PARITY_EVEN = 'even';
var PARITY_ODD = exports.PARITY_ODD = 'odd';
var PARITY_MARK = exports.PARITY_MARK = 'mark';
var PARITY_SPACE = exports.PARITY_SPACE = 'space';

var DEFAULT_PORT = exports.DEFAULT_PORT = '/dev/ttyAMA0';

var port = Symbol('port');
var options = Symbol('options');
var portInstance = Symbol('portInstance');
var isOpen = Symbol('isOpen');

var Serial = exports.Serial = function (_Peripheral) {
  _inherits(Serial, _Peripheral);

  function Serial() {
    var _ref = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

    var _ref$portId = _ref.portId;
    var portId = _ref$portId === undefined ? DEFAULT_PORT : _ref$portId;
    var _ref$baudRate = _ref.baudRate;
    var baudRate = _ref$baudRate === undefined ? 9600 : _ref$baudRate;
    var _ref$dataBits = _ref.dataBits;
    var dataBits = _ref$dataBits === undefined ? 8 : _ref$dataBits;
    var _ref$stopBits = _ref.stopBits;
    var stopBits = _ref$stopBits === undefined ? 1 : _ref$stopBits;
    var _ref$parity = _ref.parity;
    var parity = _ref$parity === undefined ? PARITY_NONE : _ref$parity;

    _classCallCheck(this, Serial);

    var pins = [];
    if (port === DEFAULT_PORT) {
      pins.push('TXD0', 'RXD0');
    }

    var _this = _possibleConstructorReturn(this, Object.getPrototypeOf(Serial).call(this, pins));

    _this[port] = portId;
    _this[options] = {
      baudRate: baudRate,
      dataBits: dataBits,
      stopBits: stopBits,
      parity: parity
    };
    Object.defineProperties(_this, {
      port: {
        get: function get() {
          return portId;
        },

        enumerable: true
      },
      baudRate: {
        get: function get() {
          return baudRate;
        },

        enumerable: true
      },
      dataBits: {
        get: function get() {
          return dataBits;
        },

        enumerable: true
      },
      stopBits: {
        get: function get() {
          return stopBits;
        },

        enumerable: true
      },
      parity: {
        get: function get() {
          return parity;
        },

        enumerable: true
      }
    });
    return _this;
  }

  _createClass(Serial, [{
    key: 'destroy',
    value: function destroy() {
      this.close();
    }
  }, {
    key: 'open',
    value: function open(cb) {
      var _this2 = this;

      if (this[isOpen]) {
        setImmediate(cb);
        return;
      }
      this[portInstance] = new _serialport.SerialPort(this[port], this[options]);
      this[portInstance].on('open', function () {
        _this2[portInstance].on('data', function (data) {
          _this2.emit('data', data);
        });
        _this2[isOpen] = true;
        cb();
      });
    }
  }, {
    key: 'close',
    value: function close(cb) {
      if (!this[isOpen]) {
        setImmediate(cb);
        return;
      }
      this[isOpen] = false;
      this[portInstance].close(cb);
    }
  }, {
    key: 'write',
    value: function write(data, cb) {
      if (!this[isOpen]) {
        throw new Error('Attempted to write to a closed serial port');
      }
      this[portInstance].write(data, cb);
    }
  }, {
    key: 'flush',
    value: function flush(cb) {
      if (!this[isOpen]) {
        throw new Error('Attempted to flush a closed serial port');
      }
      this[portInstance].flush(cb);
    }
  }]);

  return Serial;
}(_raspiPeripheral.Peripheral);

//# sourceMappingURL=data:application/json;base64,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QkFTSixNQUFNLElBQUk7QUFDZCxVQUFJLENBQUMsS0FBSyxNQUFMLENBQUQsRUFBZTtBQUNqQixjQUFNLElBQUksS0FBSixDQUFVLDRDQUFWLENBQU4sQ0FEaUI7T0FBbkI7QUFHQSxXQUFLLFlBQUwsRUFBbUIsS0FBbkIsQ0FBeUIsSUFBekIsRUFBK0IsRUFBL0IsRUFKYzs7OzswQkFPVixJQUFJO0FBQ1IsVUFBSSxDQUFDLEtBQUssTUFBTCxDQUFELEVBQWU7QUFDakIsY0FBTSxJQUFJLEtBQUosQ0FBVSx5Q0FBVixDQUFOLENBRGlCO09BQW5CO0FBR0EsV0FBSyxZQUFMLEVBQW1CLEtBQW5CLENBQXlCLEVBQXpCLEVBSlE7Ozs7U0FwRkMiLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VzQ29udGVudCI6WyIvKlxuVGhlIE1JVCBMaWNlbnNlIChNSVQpXG5cbkNvcHlyaWdodCAoYykgMjAxNiBCcnlhbiBIdWdoZXMgPGJyeWFuQG5lYnJpLnVzPlxuXG5QZXJtaXNzaW9uIGlzIGhlcmVieSBncmFudGVkLCBmcmVlIG9mIGNoYXJnZSwgdG8gYW55IHBlcnNvbiBvYnRhaW5pbmcgYSBjb3B5XG5vZiB0aGlzIHNvZnR3YXJlIGFuZCBhc3NvY2lhdGVkIGRvY3VtZW50YXRpb24gZmlsZXMgKHRoZSBcIlNvZnR3YXJlXCIpLCB0byBkZWFsXG5pbiB0aGUgU29mdHdhcmUgd2l0aG91dCByZXN0cmljdGlvbiwgaW5jbHVkaW5nIHdpdGhvdXQgbGltaXRhdGlvbiB0aGUgcmlnaHRzXG50byB1c2UsIGNvcHksIG1vZGlmeSwgbWVyZ2UsIHB1Ymxpc2gsIGRpc3RyaWJ1dGUsIHN1YmxpY2Vuc2UsIGFuZC9vciBzZWxsXG5jb3BpZXMgb2YgdGhlIFNvZnR3YXJlLCBhbmQgdG8gcGVybWl0IHBlcnNvbnMgdG8gd2hvbSB0aGUgU29mdHdhcmUgaXNcbmZ1cm5pc2hlZCB0byBkbyBzbywgc3ViamVjdCB0byB0aGUgZm9sbG93aW5nIGNvbmRpdGlvbnM6XG5cblRoZSBhYm92ZSBjb3B5cmlnaHQgbm90aWNlIGFuZCB0aGlzIHBlcm1pc3Npb24gbm90aWNlIHNoYWxsIGJlIGluY2x1ZGVkIGluXG5hbGwgY29waWVzIG9yIHN1YnN0YW50aWFsIHBvcnRpb25zIG9mIHRoZSBTb2Z0d2FyZS5cblxuVEhFIFNPRlRXQVJFIElTIFBST1ZJREVEIFwiQVMgSVNcIiwgV0lUSE9VVCBXQVJSQU5UWSBPRiBBTlkgS0lORCwgRVhQUkVTUyBPUlxuSU1QTElFRCwgSU5DTFVESU5HIEJVVCBOT1QgTElNSVRFRCBUTyBUSEUgV0FSUkFOVElFUyBPRiBNRVJDSEFOVEFCSUxJVFksXG5GSVRORVNTIEZPUiBBIFBBUlRJQ1VMQVIgUFVSUE9TRSBBTkQgTk9OSU5GUklOR0VNRU5ULiBJTiBOTyBFVkVOVCBTSEFMTCBUSEVcbkFVVEhPUlMgT1IgQ09QWVJJR0hUIEhPTERFUlMgQkUgTElBQkxFIEZPUiBBTlkgQ0xBSU0sIERBTUFHRVMgT1IgT1RIRVJcbkxJQUJJTElUWSwgV0hFVEhFUiBJTiBBTiBBQ1RJT04gT0YgQ09OVFJBQ1QsIFRPUlQgT1IgT1RIRVJXSVNFLCBBUklTSU5HIEZST00sXG5PVVQgT0YgT1IgSU4gQ09OTkVDVElPTiBXSVRIIFRIRSBTT0ZUV0FSRSBPUiBUSEUgVVNFIE9SIE9USEVSIERFQUxJTkdTIElOXG5USEUgU09GVFdBUkUuXG4qL1xuXG5pbXBvcnQgeyBQZXJpcGhlcmFsIH0gZnJvbSAncmFzcGktcGVyaXBoZXJhbCc7XG5pbXBvcnQgeyBTZXJpYWxQb3J0IH0gZnJvbSAnc2VyaWFscG9ydCc7XG5cbmV4cG9ydCBjb25zdCBQQVJJVFlfTk9ORSA9ICdub25lJztcbmV4cG9ydCBjb25zdCBQQVJJVFlfRVZFTiA9ICdldmVuJztcbmV4cG9ydCBjb25zdCBQQVJJVFlfT0REID0gJ29kZCc7XG5leHBvcnQgY29uc3QgUEFSSVRZX01BUksgPSAnbWFyayc7XG5leHBvcnQgY29uc3QgUEFSSVRZX1NQQUNFID0gJ3NwYWNlJztcblxuZXhwb3J0IGNvbnN0IERFRkFVTFRfUE9SVCA9ICcvZGV2L3R0eUFNQTAnO1xuXG5jb25zdCBwb3J0ID0gU3ltYm9sKCdwb3J0Jyk7XG5jb25zdCBvcHRpb25zID0gU3ltYm9sKCdvcHRpb25zJyk7XG5jb25zdCBwb3J0SW5zdGFuY2UgPSBTeW1ib2woJ3BvcnRJbnN0YW5jZScpO1xuY29uc3QgaXNPcGVuID0gU3ltYm9sKCdpc09wZW4nKTtcblxuZXhwb3J0IGNsYXNzIFNlcmlhbCBleHRlbmRzIFBlcmlwaGVyYWwge1xuXG4gIGNvbnN0cnVjdG9yKHsgcG9ydElkID0gREVGQVVMVF9QT1JULCBiYXVkUmF0ZSA9IDk2MDAsIGRhdGFCaXRzID0gOCwgc3RvcEJpdHMgPSAxLCBwYXJpdHkgPSBQQVJJVFlfTk9ORSB9ID0ge30pIHtcbiAgICBjb25zdCBwaW5zID0gW107XG4gICAgaWYgKHBvcnQgPT09IERFRkFVTFRfUE9SVCkge1xuICAgICAgcGlucy5wdXNoKCdUWEQwJywgJ1JYRDAnKTtcbiAgICB9XG4gICAgc3VwZXIocGlucyk7XG4gICAgdGhpc1twb3J0XSA9IHBvcnRJZDtcbiAgICB0aGlzW29wdGlvbnNdID0ge1xuICAgICAgYmF1ZFJhdGUsXG4gICAgICBkYXRhQml0cyxcbiAgICAgIHN0b3BCaXRzLFxuICAgICAgcGFyaXR5XG4gICAgfVxuICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0aWVzKHRoaXMsIHtcbiAgICAgIHBvcnQ6IHtcbiAgICAgICAgZ2V0KCkge1xuICAgICAgICAgIHJldHVybiBwb3J0SWRcbiAgICAgICAgfSxcbiAgICAgICAgZW51bWVyYWJsZTogdHJ1ZVxuICAgICAgfSxcbiAgICAgIGJhdWRSYXRlOiB7XG4gICAgICAgIGdldCgpIHtcbiAgICAgICAgICByZXR1cm4gYmF1ZFJhdGVcbiAgICAgICAgfSxcbiAgICAgICAgZW51bWVyYWJsZTogdHJ1ZVxuICAgICAgfSxcbiAgICAgIGRhdGFCaXRzOiB7XG4gICAgICAgIGdldCgpIHtcbiAgICAgICAgICByZXR1cm4gZGF0YUJpdHNcbiAgICAgICAgfSxcbiAgICAgICAgZW51bWVyYWJsZTogdHJ1ZVxuICAgICAgfSxcbiAgICAgIHN0b3BCaXRzOiB7XG4gICAgICAgIGdldCgpIHtcbiAgICAgICAgICByZXR1cm4gc3RvcEJpdHNcbiAgICAgICAgfSxcbiAgICAgICAgZW51bWVyYWJsZTogdHJ1ZVxuICAgICAgfSxcbiAgICAgIHBhcml0eToge1xuICAgICAgICBnZXQoKSB7XG4gICAgICAgICAgcmV0dXJuIHBhcml0eVxuICAgICAgICB9LFxuICAgICAgICBlbnVtZXJhYmxlOiB0cnVlXG4gICAgICB9XG4gICAgfSk7XG4gIH1cblxuICBkZXN0cm95KCkge1xuICAgIHRoaXMuY2xvc2UoKTtcbiAgfVxuXG4gIG9wZW4oY2IpIHtcbiAgICBpZiAodGhpc1tpc09wZW5dKSB7XG4gICAgICBzZXRJbW1lZGlhdGUoY2IpO1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICB0aGlzW3BvcnRJbnN0YW5jZV0gPSBuZXcgU2VyaWFsUG9ydCh0aGlzW3BvcnRdLCB0aGlzW29wdGlvbnNdKTtcbiAgICB0aGlzW3BvcnRJbnN0YW5jZV0ub24oJ29wZW4nLCAoKSA9PiB7XG4gICAgICB0aGlzW3BvcnRJbnN0YW5jZV0ub24oJ2RhdGEnLCAoZGF0YSkgPT4ge1xuICAgICAgICB0aGlzLmVtaXQoJ2RhdGEnLCBkYXRhKTtcbiAgICAgIH0pO1xuICAgICAgdGhpc1tpc09wZW5dID0gdHJ1ZTtcbiAgICAgIGNiKCk7XG4gICAgfSk7XG4gIH1cblxuICBjbG9zZShjYikge1xuICAgIGlmICghdGhpc1tpc09wZW5dKSB7XG4gICAgICBzZXRJbW1lZGlhdGUoY2IpO1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICB0aGlzW2lzT3Blbl0gPSBmYWxzZTtcbiAgICB0aGlzW3BvcnRJbnN0YW5jZV0uY2xvc2UoY2IpO1xuICB9XG5cbiAgd3JpdGUoZGF0YSwgY2IpIHtcbiAgICBpZiAoIXRoaXNbaXNPcGVuXSkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKCdBdHRlbXB0ZWQgdG8gd3JpdGUgdG8gYSBjbG9zZWQgc2VyaWFsIHBvcnQnKTtcbiAgICB9XG4gICAgdGhpc1twb3J0SW5zdGFuY2VdLndyaXRlKGRhdGEsIGNiKTtcbiAgfVxuXG4gIGZsdXNoKGNiKSB7XG4gICAgaWYgKCF0aGlzW2lzT3Blbl0pIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcignQXR0ZW1wdGVkIHRvIGZsdXNoIGEgY2xvc2VkIHNlcmlhbCBwb3J0Jyk7XG4gICAgfVxuICAgIHRoaXNbcG9ydEluc3RhbmNlXS5mbHVzaChjYik7XG4gIH1cblxufVxuIl19