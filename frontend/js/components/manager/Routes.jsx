import React from 'react';
import { Provider } from 'react-redux';
import { Router, Route, IndexRoute, hashHistory } from 'react-router';

import App from './App.jsx';
import Dashboard from './Dashboard.jsx';

import ClientList from './ClientList.jsx';
import ClientForm from './ClientForm.jsx';
import ClientDetail from './ClientDetail.jsx';

import ClientUserList from './client_user/ClientUserList.jsx';
import ClientUserForm from './client_user/ClientUserForm.jsx';

import StoreList from './StoreList.jsx';
import StoreForm from './StoreForm.jsx';
import StoreDetail from './StoreDetail.jsx';

import AuditorList from './AuditorList.jsx';
import AuditorDetailsPage from './AuditorDetailsPage.jsx';

import StateList from './StateList.jsx';
import CityList from './CityList.jsx';

import LocationList from './LocationList.jsx';
import LocationForm from './LocationForm.jsx';

import AuditCycleList from './AuditCycleList.jsx';
import AuditCycleForm from './AuditCycleForm.jsx';
import AuditCycleDetails from './AuditCycleDetails.jsx';

import SectionForm from './SectionForm.jsx';
import SectionList from './SectionList.jsx';

import QuestionForm from './QuestionForm.jsx';

import AuditList from './AuditList.jsx';
import AuditForm from './AuditForm.jsx';

import AuditStoreList from './AuditStoreList.jsx';
import AuditStoreDetails from './AuditStoreDetails.jsx';
import AuditStoreReport from './AuditStoreReport.jsx';

import AuditFiatAssignForm from './AuditFiatAssignForm.jsx';

import ApplicationApproveForm from './ApplicationApproveForm.jsx';
import ApplicationRejectForm from './ApplicationRejectForm.jsx';
import ApplicationCompleteForm from './ApplicationCompleteForm.jsx';
import ApplicationFailForm from './ApplicationFailForm.jsx';

const Routes = () => (
    <Router history={hashHistory}>
	<Route path="/" component={App}>
		<IndexRoute component={Dashboard} />

		<Route path="client" component={ClientList}>
			<Route path="add" component={ClientForm}/>
		</Route>

		<Route path="client/:clientId" component={ClientDetail}>
			<Route path="edit" component={ClientForm}/>
			<Route path="store" component={StoreList}>
				<Route path="add" component={StoreForm}/>
			</Route>
			<Route path="audit_cycle" component={AuditCycleList}>
				<Route path="add" component={AuditCycleForm}/>
			</Route>
			<Route path="client_user" component={ClientUserList}>
				<Route path="add" component={ClientUserForm}/>
				<Route path=":clientUserId/edit" component={ClientUserForm}/>
			</Route>
		</Route>

		<Route path="store/:storeId" component={StoreDetail}>
			<Route path="edit" component={StoreForm}/>
		</Route>


		<Route path="audit_cycle/:auditCycleId" component={AuditCycleDetails}>
			<Route path="edit" component={AuditCycleForm}/>
			<Route path="questionnaire" component={SectionList}>
				<Route path="section/add" component={SectionForm}/>
				<Route path="section/:sectionId/edit" component={SectionForm}/>
				<Route path="section/:sectionId/question/add" component={QuestionForm}/>
				<Route path="section/:sectionId/question/:questionId/edit" component={QuestionForm}/>
				<Route path="section/:sectionId/question/:questionId/delete" component={QuestionForm}/>
			</Route>
			<Route path="audit" components={AuditList}>
				<Route path="add" component={AuditForm}/>
				<Route path=":auditId/edit" component={AuditForm}/>
				<Route path=":auditId/application/fiat" component={AuditFiatAssignForm}/>
				<Route path=":auditId/application/:applicationId/approve" component={ApplicationApproveForm}/>
				<Route path=":auditId/application/:applicationId/reject" component={ApplicationRejectForm}/>
			</Route>
			<Route path="audit_store" components={AuditStoreList}/>
		</Route>

		<Route path="audit_store/:auditStoreId" components={AuditStoreDetails}>
			<Route path="report" components={AuditStoreReport}/>
		</Route>

		<Route path="auditor" component={AuditorList}/>
		<Route path="auditor/:auditorId" component={AuditorDetailsPage}/>

		<Route path="state" component={StateList}/>
		<Route path="state/:stateId/city" component={CityList}/>
		<Route path="state/:stateId/city/:cityId/location" component={LocationList}>
			<Route path="add" component={LocationForm}/>
			<Route path=":locationId/edit" component={LocationForm}/>
		</Route>
	</Route>
    </Router>
);

export default Routes;
