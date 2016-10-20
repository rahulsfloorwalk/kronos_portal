import React from 'react';
import { Provider } from 'react-redux';
import { Router, Route, IndexRoute, hashHistory } from 'react-router';

import AuditorApp from './components/auditor/App.jsx';
import ManagerApp from './components/manager/App.jsx';
import Dashboard from './components/Dashboard.jsx';
import DetailsPage from './components/DetailsPage.jsx';

import ProfileInfoForm from './components/ProfileInfoForm.jsx';
import BankInfoForm from './components/BankInfoForm.jsx';
import AdditionalInfoForm from './components/AdditionalInfoForm.jsx';

export const AuditorRoot = ({store}) => (
  <Provider store={store}>
    <Router history={hashHistory}>
	<Route path="/" component={AuditorApp}>
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

export const ManagerRoot = ({store}) => (
  <Provider store={store}>
    <Router history={hashHistory}>
	<Route path="/" component={ManagerApp}>
		<Route path="client" component={ClientList}/>
	</Route>
    </Router>
  </Provider>
);

