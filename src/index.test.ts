import { callable, makeReducers } from "./index";

describe("callable", () => {
  test("should create an action creators object", () => {
    const actionCreators = callable(
      {
        simpleAction: state => state
      },
      {}
    );

    expect(actionCreators).toHaveProperty("simpleAction");
    expect(typeof actionCreators.simpleAction).toBe("function");
  });

  test("action creators should create an action", () => {
    const actionCreators = callable(
      {
        simpleAction: state => state
      },
      {}
    );

    const action = actionCreators.simpleAction();

    expect(action).toBeDefined();
    expect(action.type).toBe("@callable.simpleAction");
  });

  test("prefix argument should change the action type prefix", () => {
    const actionCreators = callable(
      {
        simpleAction: state => state
      },
      undefined,
      "new_prefix"
    );

    const action = actionCreators.simpleAction();

    expect(action).toBeDefined();
    expect(action.type).toBe("@new_prefix.simpleAction");
  });

  test("delimiter argument should change the action type delimiter", () => {
    const actionCreators = callable(
      {
        simpleAction: state => state
      },
      undefined,
      undefined,
      "/"
    );

    const action = actionCreators.simpleAction();

    expect(action).toBeDefined();
    expect(action.type).toBe("@callable/simpleAction");
  });
});

describe("makeReducers", () => {
  test("should create reducers", () => {
    const actionCreators = callable(
      {
        simpleAction: state => state
      },
      {}
    );

    const reducers = makeReducers(actionCreators);

    expect(reducers).toHaveProperty("simpleAction");
    expect(typeof reducers.simpleAction).toBe("function");
  });

  test("created reducer should process it's target actions", () => {
    const actionCreators = callable(
      {
        increment: (state: number) => state + 1
      },
      1
    );

    const reducers = makeReducers({
      incrementReducer: actionCreators
    });

    const result = reducers.incrementReducer(2, actionCreators.increment());

    expect(result).toBe(3);
  });
});
