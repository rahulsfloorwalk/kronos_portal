import React from 'react';
import { Provider } from 'react-redux';
import { Router, Route, IndexRoute, hashHistory } from 'react-router';

import App from './App.jsx';
import Dashboard from './Dashboard.jsx';
import DetailsPage from './DetailsPage.jsx';

import ProfileInfoForm from '../ProfileInfoForm.jsx';
import BankInfoForm from '../BankInfoForm.jsx';
import AdditionalInfoForm from '../AdditionalInfoForm.jsx';

const Routes = ({store}) => (
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

export default Routes;
