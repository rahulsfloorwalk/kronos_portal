import React from 'react';
import { Provider } from 'react-redux';
import { Router, Route, IndexRoute, hashHistory } from 'react-router';

import App from './components/App.jsx';
import Dashboard from './components/Dashboard.jsx';
import ProfileInfo from './components/ProfileInfo.jsx';
import ProfileInfoForm from './components/ProfileInfoForm.jsx';

export const Root = ({store}) => (
  <Provider store={store}>
    <Router history={hashHistory}>
	<Route path="/" component={App}>
		<IndexRoute component={Dashboard} />
		<Route path="details" component={ProfileInfo}/>
		<Route path="profile/edit" component={ProfileInfoForm}/>
	</Route>
    </Router>
  </Provider>
);

