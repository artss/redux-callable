"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.callable = callable;
exports.makeReducers = makeReducers;

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; var ownKeys = Object.keys(source); if (typeof Object.getOwnPropertySymbols === 'function') { ownKeys = ownKeys.concat(Object.getOwnPropertySymbols(source).filter(function (sym) { return Object.getOwnPropertyDescriptor(source, sym).enumerable; })); } ownKeys.forEach(function (key) { _defineProperty(target, key, source[key]); }); } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

function _toConsumableArray(arr) { return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _nonIterableSpread(); }

function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance"); }

function _iterableToArray(iter) { if (Symbol.iterator in Object(iter) || Object.prototype.toString.call(iter) === "[object Arguments]") return Array.from(iter); }

function _arrayWithoutHoles(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = new Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } }

var PREFIX = 'callable';
var DELIMITER = '.';
var START = '@';
var initialStateSymbol = Symbol('initialState');
var run = Symbol('run');

function action(fn, type) {
  return function () {
    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    if (args[0] === run) {
      return fn.apply(void 0, _toConsumableArray(args.slice(1)));
    }

    return {
      type: type,
      args: args
    };
  };
}

function identify(reducers) {
  var path = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : [];
  var delimiter = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : DELIMITER;

  /* eslint-disable no-param-reassign */
  Object.getOwnPropertySymbols(reducers).forEach(function (sym) {
    reducers[sym] = action(reducers[sym], Symbol.keyFor(sym));
  });
  Object.keys(reducers).forEach(function (key) {
    var itemPath = _toConsumableArray(path).concat([key]);

    var itemPathString = key.startsWith(START) ? key : START + itemPath.join(delimiter);
    var item = reducers[key];

    if (typeof item === 'function') {
      item = action(item, itemPathString);

      item.toString = function () {
        return itemPathString;
      };

      reducers[key] = item;
      reducers[Symbol.for(itemPathString)] = item;
    } else if (_typeof(item) === 'object') {
      identify(item, itemPath, delimiter);
    }
  });
  /* eslint-enable no-param-reassign */

  return reducers;
}

function callable(reducers, initialState, prefix, delimiter) {
  return _objectSpread({}, identify(reducers, [prefix || PREFIX], delimiter), _defineProperty({}, initialStateSymbol, initialState));
}

function makeReducers(reducers) {
  return Object.keys(reducers).reduce(function (memo, key) {
    return _objectSpread({}, memo, _defineProperty({}, key, function () {
      var state = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : reducers[key][initialStateSymbol];

      var _ref = arguments.length > 1 ? arguments[1] : undefined,
          type = _ref.type,
          args = _ref.args;

      var reducer = reducers[key][Symbol.for(type)];
      return reducer ? reducer.apply(void 0, [run, state].concat(_toConsumableArray(args))) : state;
    }));
  }, {});
}
