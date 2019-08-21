const PREFIX = "callable";
const DELIMITER = ".";
const START = "@";

const initialStateSymbol = Symbol("initialState");
const run = Symbol("run");

type CallableReducer<T = any> = (state: T, ...args: any[]) => T;
// TODO: symbol types are not allowed: https://github.com/Microsoft/TypeScript/issues/24587
type CallableReducersMapObject<T = any> = { [key: string]: CallableReducer<T> };
type Action = { type: string; [key: string]: any };
type ActionCreator<A = Action> = (...args: any[]) => A;
// TODO infer action creator generic parameter
type ActionCreatorMapObject<K extends keyof any, S = any> = {
  [P in K]: ActionCreator
} & { [initialStateSymbol]: S };

type Reducer<S = any, A extends Action = Action> = (state: S, action: A) => S;
type ReducersMapObject<K extends string | number | symbol> = Record<K, Reducer>;

function action<T extends CallableReducer>(
  fn: T,
  type: string | symbol
): ActionCreator<ReturnType<T> | Action> {
  return (...args: any[]) => {
    if (args[0] === run) {
      const argsWithoutRun = args.slice(1);
      const state: any = argsWithoutRun.shift();
      return fn(state, ...argsWithoutRun);
    }

    return { type, args };
  };
}

/**
 * TODO: Type safety is intentionally disabled for this function,
 * because it modifies types in reducer parameter. It's possible
 * to refactor the function, but it might lead to backwards
 * incompatible changes
 */
function identify(
  reducers: any,
  path: string[] = [],
  delimiter: string = DELIMITER
) {
  /* eslint-disable no-param-reassign */
  Object.getOwnPropertySymbols(reducers).forEach(sym => {
    reducers[sym] = action(reducers[sym], Symbol.keyFor(sym)!);
  });

  Object.keys(reducers).forEach(key => {
    const itemPath = [...path, key];
    const itemPathString = key.startsWith(START)
      ? key
      : START + itemPath.join(delimiter);
    let item = reducers[key];

    if (typeof item === "function") {
      item = action(item, itemPathString);
      item.toString = () => itemPathString;

      reducers[key] = item;
      reducers[Symbol.for(itemPathString)] = item;
    } else if (typeof item === "object") {
      identify(item, itemPath, delimiter);
    }
  });
  /* eslint-enable no-param-reassign */

  return reducers;
}

export function callable<T extends CallableReducersMapObject<S>, S>(
  reducers: T,
  initialState: S,
  prefix?: string,
  delimiter?: string
): ActionCreatorMapObject<keyof T, S> {
  return {
    ...identify(reducers, [prefix || PREFIX], delimiter),
    [initialStateSymbol]: initialState
  };
}

export function makeReducers<
  T extends Record<string, ActionCreatorMapObject<any>>,
  R = ReducersMapObject<keyof T>
>(reducers: T): R {
  return Object.keys(reducers).reduce(
    (memo: R, key) => ({
      ...memo,
      [key]: (
        state = reducers[key][initialStateSymbol],
        { type, args }: Action
      ) => {
        // TODO indexing with symbols https://github.com/Microsoft/TypeScript/issues/1863
        const reducer = reducers[key][Symbol.for(type) as any];
        return reducer ? reducer(run, state, ...args) : state;
      }
    }),
    {} as R
  );
}
