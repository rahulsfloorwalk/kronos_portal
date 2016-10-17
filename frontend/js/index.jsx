import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';

import * as Redux from 'redux';
import ReduxThunk from 'redux-thunk';
import ReduxLogger from 'redux-logger';

import { Root } from './routes.jsx';
import { rootReducer } from './reducers.js';

var store = Redux.createStore(
	rootReducer,
	Redux.applyMiddleware(
		ReduxThunk,
		ReduxLogger()
	)
);

ReactDOM.render(
	<Root store={store}/>,
	document.getElementById('root')
);
