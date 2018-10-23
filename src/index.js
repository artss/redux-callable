const PREFIX = 'saymyname';
const DELIMITER = '.';
const START = '@';

const initialStateSymbol = Symbol('initialState');
const run = Symbol('run');

function action(fn, type) {
  return (...args) => {
    if (args[0] === run) {
      return fn(...args.slice(1));
    }

    return { type, args };
  };
}

function identify(reducers, path = [], delimiter = DELIMITER) {
  /* eslint-disable no-param-reassign */
  Object.getOwnPropertySymbols(reducers).forEach((sym) => {
    reducers[sym] = action(reducers[sym], Symbol.keyFor(sym));
  });

  Object.keys(reducers).forEach((key) => {
    const itemPath = [...path, key];
    const itemPathString = key.startsWith(START)
      ? key
      : START + itemPath.join(delimiter);
    let item = reducers[key];

    if (typeof item === 'function') {
      item = action(item, itemPathString);
      item.toString = () => itemPathString;

      reducers[key] = item;
      reducers[Symbol.for(itemPathString)] = item;
    } else if (typeof item === 'object') {
      identify(item, itemPath, delimiter);
    }
  });
  /* eslint-enable no-param-reassign */

  return reducers;
}

export function saymyname(reducers, initialState, prefix, delimiter) {
  return {
    ...identify(reducers, [prefix || PREFIX], delimiter),
    [initialStateSymbol]: initialState,
  };
}

export function makeReducers(reducers) {
  return Object.keys(reducers).reduce(
    (memo, key) => ({
      ...memo,
      [key]: (state = reducers[key][initialStateSymbol], { type, args }) => {
        const reducer = reducers[key][Symbol.for(type)];
        return reducer
          ? reducer(run, state, ...args)
          : state;
      },
    }),
    {}
  );
}
