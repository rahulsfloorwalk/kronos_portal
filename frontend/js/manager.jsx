import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';

import * as Redux from 'redux';
import ReduxThunk from 'redux-thunk';
import ReduxLogger from 'redux-logger';

import Routes from './components/manager/Routes.jsx';
import { rootReducer } from './reducers_manager.js';

var store = Redux.createStore(
	rootReducer,
	Redux.applyMiddleware(
		ReduxThunk,
		ReduxLogger()
	)
);

ReactDOM.render(
	<Provider store={store}>
		<Routes store={store}/>
	</Provider>,
	document.getElementById('root')
);
