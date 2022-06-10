import React from "react";
import { Router, Route, IndexRoute, hashHistory } from "react-router";

import App from "./App.jsx";

import Dashboard from "./Dashboard.jsx";

import AuditCycleList from "./audit_cycle/AuditCycleList.jsx";
import ProfileInfoPanel from "./profile/ProfileInfoPanel.jsx";
import ContactUs from "./ContactUs.jsx";
import FAQ from "./FAQ.jsx";

import EmailNotification from "./EmailNotification.jsx";
import ProjectDetails from "./ProjectDetails.jsx";

import AuditCycleForm from "./audit_cycle/AuditCycleForm.jsx";
import AuditCycleDetails from "./audit_cycle/AuditCycleDetails.jsx";
import PostApprovalDescriptionForm from "./audit_cycle/PostApprovalDescriptionForm.jsx";
import CheckPoints from "./audit_cycle/CheckPoints.jsx";
import AuditAlignmentFactors from "./audit_cycle/AuditAlignmentFactors.jsx";
import AuditCycleCopyForm from "./audit_cycle/AuditCycleCopyForm.jsx";

import SectionList from "./questionnaire/SectionList.jsx";
import SectionCopyForm from "./questionnaire/SectionCopyForm.jsx";
import SectionAddForm from "./questionnaire/SectionAddForm.jsx";
import SectionEditForm from "./questionnaire/SectionEditForm.jsx";
import SectionProofTag from "./questionnaire/SectionProofTag.jsx";
import QuestionForm from "./questionnaire/QuestionForm.jsx";

import QuestionnaireTypeList from "./questionnaire_type/QuestionnaireTypeList.jsx";
import QuestionnaireTypeForm from "./questionnaire_type/QuestionnaireTypeForm.jsx";
import QuestionnaireTypeEditForm from "./questionnaire_type/QuestionnaireTypeEditForm.jsx";

import AuditList from "./audit/AuditList.jsx";
import AuditForm from "./audit/AuditForm.jsx";
import AuditCopyForm from "./audit/AuditCopyForm.jsx";

import StoreList from "./store/StoreList.jsx";
import StoreForm from "./store/StoreForm.jsx";
import StoreImportForm from "./store/StoreImportForm.jsx";
import StoreAssignForm from "./store/StoreAssignForm.jsx";
import ClientUserList from "./client_user/ClientUserList.jsx";
import ClientUserForm from "./client_user/ClientUserForm.jsx";
import ClientUserAssignStores from "./client_user/ClientUserAssignStores.jsx";
import ProfileInfoForm from "./profile/ProfileInfoForm.jsx";
import BankInfoForm from "./profile/BankInfoForm.jsx";

import PaymentList from "./payment/PaymentList.jsx";

import QuestionnaireInsertForm from "./questionnaire/QuestionnaireInsertForm.jsx";
import QuotationDetail from "./quotation/QuotationDetail.jsx";

const IndexComponent = () => null;

const Routes = () => (<Router history={hashHistory}>
	<Route path="/" component={App}>
		<IndexRoute component={IndexComponent}/>

		<Route path="/email_notification" component={EmailNotification}/>

		<Route path="/dashboard" component={Dashboard}/>
		<Route path="/reports" component={Dashboard}/>
		<Route path="projects" component={ProjectDetails}>
			<Route path=":clientId/audit_cycle" component={AuditCycleList}>
				<Route path="add" component={AuditCycleForm}/>
			</Route>
			<Route path=":clientId/questionnaire_type" component={QuestionnaireTypeList}>
				<Route path="add" component={QuestionnaireTypeForm}/>
				<Route path=":questionnaireTypeId/edit" component={QuestionnaireTypeEditForm}/>
			</Route>
			<Route path=":clientId/store" component={StoreList}>
				<Route path="add" component={StoreForm}/>
				<Route path="import" component={StoreImportForm}/>
				<Route path=":storeId/edit" component={StoreForm}/>
				<Route path=":storeId/assign" component={StoreAssignForm}/>
			</Route>
			<Route path=":clientId/client_user" component={ClientUserList}>
				<Route path="add" component={ClientUserForm}/>
				<Route path=":clientUserId/edit" component={ClientUserForm}/>
				<Route path=":clientUserId/assign_stores" component={ClientUserAssignStores}/>
			</Route>
		</Route>

		<Route path="audit_cycle/:auditCycleId" component={AuditCycleDetails}>
			<Route path="edit" component={AuditCycleForm} />
			<Route path="copy" component={AuditCycleCopyForm}/>
			<Route path="post_approval_description" component={PostApprovalDescriptionForm}/>
			<Route path="checkpoints" component={CheckPoints}/>
			<Route path="audit_alignment_factors" component={AuditAlignmentFactors} />

			<Route path="questionnaire" component={SectionList}>
				<Route path="insert" component={QuestionnaireInsertForm}/>
				<Route path="section/copy" component={SectionCopyForm}/>
				<Route path="section/add" component={SectionAddForm}/>
				<Route path="section/:sectionId/edit" component={SectionEditForm}/>
				<Route path="section/:sectionId/proof_tag" component={SectionProofTag}/>
				<Route path="section/:sectionId/question/add" component={QuestionForm}/>
				<Route path="section/:sectionId/question/:questionId/edit" component={QuestionForm}/>
				<Route path="section/:sectionId/question/:questionId/delete" component={QuestionForm}/>
			</Route>

			<Route path="audit" components={AuditList}>
				<Route path="copy" component={AuditCopyForm}/>
				<Route path="add" component={AuditForm}/>
				<Route path=":auditId/edit" component={AuditForm}/>
			</Route>
		</Route>

		<Route path="/profile" component={ProfileInfoPanel}>
			<Route path="edit" component={ProfileInfoForm}/>
		</Route>
		<Route path="bankinfo/edit" component={BankInfoForm}/>
		<Route path="/billing" component={PaymentList}/>
		<Route path="/faq" component={FAQ}/>
		<Route path="/contact_us" component={ContactUs}/>

		<Route path="/quotation" component={QuotationDetail} />
	</Route>
</Router>);

export default Routes;
