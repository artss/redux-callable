# redux-callable

Creates reducers that can be called as they are, without dispatching action objects and keeping hundreds of `ACTION_TYPE` constants.

### reducers/user.js

```js
import { callable } from 'redux-callable';

export default callable({
  setUserData(state, data) {
    return { ...state, ...data };
  },

  logout() {
    return {};
  }
}, {}, 'user');
```

### reducers/notes.js

```js
import { callable } from 'redux-callable';
import './user';

export default callable({
  addNote(state, title, text, tags) {
    return state.concat({ title, text, tags });
  },

  [user.logout]: () => []
}, [], 'notes');
```

### reducers/index.js

```js
import { combineReducers } from 'redux';
import { makeReducers } from 'redux-callable';

import user from './user';
import notes from './notes';

const reducers = makeReducers({
  user,
  notes,
});

export default combineReducers(reducers);
```

### actions/index.js

```js
import notes from '../reducers/notes';
import { post } from '../api';

export const addNote = (title, text, note) => notes.addNote(title, text, tags);

export const login = (username, password) => async (dispatch) => {
  const data = post('/user/login', { username, password });
  dispatch(user.setUserData(data));
}
```
