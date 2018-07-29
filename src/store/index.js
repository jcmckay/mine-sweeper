import { createStore } from 'redux';
import combineReducers from '../reducers';
import { PreloadedState } from './preloadedState';

// /* eslint-disable no-underscore-dangle */
const composeEnhancers =
  window.__REDUX_DEVTOOLS_EXTENSION__ && window.__REDUX_DEVTOOLS_EXTENSION__();
// /* eslint-enable */

const store = createStore(combineReducers, PreloadedState, composeEnhancers);

export default store;
