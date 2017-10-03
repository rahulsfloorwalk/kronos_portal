import React from 'react';
import { Provider } from 'react-redux';
import { Router, Route, IndexRoute, hashHistory } from 'react-router';

import ReactGA from 'react-ga';

import { auditorGAId } from '../../../config.js';

import App from './App.jsx';
import Dashboard from './Dashboard.jsx';
import DetailsPage from './DetailsPage.jsx';

import ClientList from './ClientList.jsx';
import AuditList from './AuditList.jsx';
import AuditApplyForm from './AuditApplyForm.jsx';
import AuditCancelForm from './AuditCancelForm.jsx';

import AuditStoreList from './AuditStoreList.jsx';
import AuditStoreDetails from './AuditStoreDetails.jsx';

import SectionList from './SectionList.jsx';

import ProfileInfoForm from './ProfileInfoForm.jsx';
import BankInfoForm from './BankInfoForm.jsx';
import AdditionalInfoForm from './AdditionalInfoForm.jsx';

import PaymentList from './PaymentList.jsx';

ReactGA.initialize(auditorGAId);

function logPageView() {
	console.log(window.location.pathname, window.location.hash);
	ReactGA.set({ page: window.location.pathname });
	ReactGA.pageview(window.location.pathname + window.location.hash);
}


const Routes = ({store}) => (
  <Provider store={store}>
    <Router history={hashHistory} onUpdate={logPageView}>
	<Route path="/" component={App}>
		<IndexRoute component={Dashboard}/>
		<Route path="details" component={DetailsPage}>
			<Route path="profile/edit" component={ProfileInfoForm}/>
			<Route path="bank/edit" component={BankInfoForm}/>
			<Route path="additional/edit" component={AdditionalInfoForm}/>
		</Route>
		<Route path="audit" component={ClientList}/>
		<Route path="audit/cycle/:auditCycleId" component={AuditList}>
			<Route path="audit/:auditId">
				<Route path="apply" component={AuditApplyForm}/>
				<Route path="cancel" component={AuditCancelForm}/>
			</Route>
		</Route>
		<Route path="audit_store" component={AuditStoreList}/>
		<Route path="audit_store/:auditStoreId/section" component={AuditStoreDetails}/>
		<Route path="payment" component={PaymentList}/>
	</Route>
    </Router>
  </Provider>
);

export default Routes;
