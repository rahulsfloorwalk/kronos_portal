import React from 'react';
import { Provider } from 'react-redux';
import { Router, Route, IndexRoute, hashHistory } from 'react-router';

import App from './components/App.jsx';
import Dashboard from './components/Dashboard.jsx';
import DetailsPage from './components/DetailsPage.jsx';

import ProfileInfoForm from './components/ProfileInfoForm.jsx';
import BankInfoForm from './components/BankInfoForm.jsx';
import AdditionalInfoForm from './components/AdditionalInfoForm.jsx';

export const Root = ({store}) => (
  <Provider store={store}>
    <Router history={hashHistory}>
	<Route path="/" component={App}>
		<IndexRoute component={Dashboard} />
		<Route path="details" component={DetailsPage}>
			<Route path="profile/edit" component={ProfileInfoForm}/>
			<Route path="bank/edit" component={BankInfoForm}/>
			<Route path="additional/edit" component={AdditionalInfoForm}/>
		</Route>
	</Route>
    </Router>
  </Provider>
);

