import React from 'react';
import { Provider } from 'react-redux';
import { Router, Route, IndexRoute, hashHistory } from 'react-router';

import App from './App.jsx';
import Dashboard from './Dashboard.jsx';

import ClientList from './client/ClientList.jsx';
import ClientForm from './client/ClientForm.jsx';
import ClientDetail from './client/ClientDetail.jsx';

import ClientUserList from './client_user/ClientUserList.jsx';
import ClientUserForm from './client_user/ClientUserForm.jsx';

import QuestionnaireTypeList from './questionnaire_type/QuestionnaireTypeList.jsx';

import StoreList from './StoreList.jsx';
import StoreForm from './StoreForm.jsx';
import StoreDetail from './StoreDetail.jsx';
import StoreAssignForm from './StoreAssignForm.jsx';

import AuditorList from './auditor/AuditorList.jsx';
import AuditorDetailsPage from './auditor/AuditorDetailsPage.jsx';
import AuditorReportList from './auditor/AuditorReportList.jsx';
import AuditorApplicationList from './auditor/AuditorApplicationList.jsx';
import AuditorEmailLog from './auditor/AuditorEmailLog.jsx';
import AuditorIdProof from './auditor/AuditorIdProof.jsx';
import AuditorPayment from './auditor/AuditorPayment.jsx';
import AuditorDetails from './auditor/AuditorDetails.jsx';
import AuditorReferralList from './auditor/AuditorReferralList.jsx';
import PreferencesForm from "./auditor/PreferencesForm.jsx";

import StateList from './location/StateList.jsx';
import CityList from './location/CityList.jsx';

import AuditCycleList from './AuditCycleList.jsx';
import AuditCycleForm from './AuditCycleForm.jsx';
import AuditCycleDetails from './AuditCycleDetails.jsx';
import AuditCyclePaymentList from './AuditCyclePaymentList.jsx';
import PostApprovalDescriptionForm from './PostApprovalDescriptionForm.jsx';
import OpportunityEmailRecordList from './OpportunityEmailRecordList.jsx';
import OpportunityEmailRecordForm from './OpportunityEmailRecordForm.jsx';

import SectionForm from './SectionForm.jsx';
import SectionList from './SectionList.jsx';
import SectionCopyForm from './SectionCopyForm.jsx';

import QuestionForm from './QuestionForm.jsx';

import AuditList from './AuditList.jsx';
import AuditCopyForm from './AuditCopyForm.jsx';
import AuditForm from './AuditForm.jsx';

import AuditStoreList from './AuditStoreList.jsx';
import AuditStoreAcceptForm from './AuditStoreAcceptForm.jsx';
import AuditStoreCompleteForm from './AuditStoreCompleteForm.jsx';
import AuditStoreQARatingForm from './AuditStoreQARatingForm.jsx';
import AuditStoreDetails from './AuditStoreDetails.jsx';
import AuditStoreReport from './AuditStoreReport.jsx';

import AuditFiatAssignForm from './AuditFiatAssignForm.jsx';

import ApplicationApproveForm from './ApplicationApproveForm.jsx';
import ApplicationRejectForm from './ApplicationRejectForm.jsx';

import ModeratorList from './moderator/ModeratorList.jsx';
import ModeratorForm from './moderator/ModeratorForm.jsx';
import AuditCycleModeratorList from './AuditCycleModeratorList.jsx';
import AuditCycleModeratorAssignForm from './AuditCycleModeratorAssignForm.jsx';

import ManagerForm from './manager/ManagerForm.jsx';
import ManagerList from './manager/ManagerList.jsx';

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
				<Route path=":storeId/edit" component={StoreForm}/>
				<Route path=":storeId/assign" component={StoreAssignForm}/>
			</Route>
			<Route path="audit_cycle" component={AuditCycleList}>
				<Route path="add" component={AuditCycleForm}/>
			</Route>
			<Route path="client_user" component={ClientUserList}>
				<Route path="add" component={ClientUserForm}/>
				<Route path=":clientUserId/edit" component={ClientUserForm}/>
			</Route>
			<Route path="questionnaire_type" component={QuestionnaireTypeList}/>
		</Route>



		<Route path="audit_cycle/:auditCycleId" component={AuditCycleDetails}>
			<Route path="edit" component={AuditCycleForm}/>
			<Route path="post_approval_description" component={PostApprovalDescriptionForm}/>
			<Route path="questionnaire" component={SectionList}>
				<Route path="section/copy" component={SectionCopyForm}/>
				<Route path="section/add" component={SectionForm}/>
				<Route path="section/:sectionId/edit" component={SectionForm}/>
				<Route path="section/:sectionId/question/add" component={QuestionForm}/>
				<Route path="section/:sectionId/question/:questionId/edit" component={QuestionForm}/>
				<Route path="section/:sectionId/question/:questionId/delete" component={QuestionForm}/>
			</Route>
			<Route path="audit" components={AuditList}>
				<Route path="copy" component={AuditCopyForm}/>
				<Route path="add" component={AuditForm}/>
				<Route path=":auditId/edit" component={AuditForm}/>
				<Route path=":auditId/application/fiat" component={AuditFiatAssignForm}/>
				<Route path=":auditId/application/:applicationId/approve" component={ApplicationApproveForm}/>
				<Route path=":auditId/application/:applicationId/reject" component={ApplicationRejectForm}/>
				<Route path="audit_store/:auditStoreId/accept" component={AuditStoreAcceptForm}/>
			</Route>
			<Route path="audit_store" components={AuditStoreList}>
				<Route path=":auditStoreId/accept" component={AuditStoreAcceptForm}/>
			</Route>
			<Route path="payment" components={AuditCyclePaymentList}/>
			<Route path="moderator" components={AuditCycleModeratorList}>
				<Route path="assign" component={AuditCycleModeratorAssignForm}/>
			</Route>
			<Route path="opportunity_email" components={OpportunityEmailRecordList}>
				<Route path="schedule" component={OpportunityEmailRecordForm}/>
			</Route>
		</Route>

		<Route path="audit_store/:auditStoreId" components={AuditStoreDetails}>
			<Route path="report" components={AuditStoreReport}/>
			<Route path="qa_rating" components={AuditStoreQARatingForm}/>
		</Route>

		<Route path="auditor" component={AuditorList}/>
		<Route path="auditor/:auditorId" component={AuditorDetailsPage}>
      <Route path="details" component={AuditorDetails}>
	      <Route path="preferences/edit" component={PreferencesForm}/>
	</Route>
      <Route path="applications" component={AuditorApplicationList}/>
      <Route path="reports" component={AuditorReportList}/>
		      <Route path="email_log" component={AuditorEmailLog}/>
          <Route path="id_proof" component={AuditorIdProof}/>
          <Route path="payment" component={AuditorPayment}/>
          <Route path="referral" component={AuditorReferralList}/>
    </Route>

		<Route path="state" component={StateList}>
			<Route path=":stateId" component={CityList}/>
		</Route>

		<Route path="moderator" component={ModeratorList}>
			<Route path="add" component={ModeratorForm}/>
			<Route path=":userId/edit" component={ModeratorForm}/>
		</Route>
		<Route path="manager" component={ManagerList}>
			<Route path="add" component={ManagerForm}/>
			<Route path=":userId/edit" component={ManagerForm}/>
		</Route>
	</Route>
    </Router>
);

export default Routes;
