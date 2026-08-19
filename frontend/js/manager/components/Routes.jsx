import React from "react";
import { Router, Route, IndexRoute, hashHistory } from "react-router";

import App from "./App.jsx";
import Dashboard from "./Dashboard.jsx";

import ClientList from "./client/ClientList.jsx";
import ClientForm from "./client/ClientForm.jsx";
import ClientDetail from "./client/ClientDetail.jsx";

import ClientUserList from "./client_user/ClientUserList.jsx";
import ClientUserForm from "./client_user/ClientUserForm.jsx";
import ClientUserAssignStores from "./client_user/ClientUserAssignStores.jsx";

import ClientManagerList from "./client_manager/ClientManagerList.jsx";
import ClientManagerForm from "./client_manager/ClientManagerForm.jsx";
import ClientManagerDelete from "./client_manager/ClientManagerDelete.jsx";

import QuestionnaireTypeList from "./questionnaire_type/QuestionnaireTypeList.jsx";
import QuestionnaireTypeForm from "./questionnaire_type/QuestionnaireTypeForm.jsx";
import QuestionnaireTypeEditForm from "./questionnaire_type/QuestionnaireTypeEditForm.jsx";

import StoreList from "./store/StoreList.jsx";
import StoreForm from "./store/StoreForm.jsx";
import StoreImportForm from "./store/StoreImportForm.jsx";
import StoreAssignForm from "./store/StoreAssignForm.jsx";

import AuditorList from "./auditor/AuditorList.jsx";
import AuditorDetailsPage from "./auditor/AuditorDetailsPage.jsx";
import AuditorReportList from "./auditor/AuditorReportList.jsx";
import AuditorApplicationList from "./auditor/AuditorApplicationList.jsx";
import AuditorEmailLog from "./auditor/AuditorEmailLog.jsx";
import AuditorIdProof from "./auditor/AuditorIdProof.jsx";
import AuditorPayment from "./auditor/AuditorPayment.jsx";
import AuditorDetails from "./auditor/AuditorDetails.jsx";
import AuditorReferralList from "./auditor/AuditorReferralList.jsx";
import PreferencesForm from "./auditor/PreferencesForm.jsx";
import AuditorRatingForm from "./auditor/AuditorRatingForm.jsx";

import AgencyUserSearch from "./agency_user/AgencyUserSearch.jsx";
import AgencyUserDetails from "./agency_user/AgencyUserDetails.jsx";

import CountryList from "./location/CountryList.jsx";
import StateList from "./location/StateList.jsx";
import CityList from "./location/CityList.jsx";

import AuditCycleList from "./audit_cycle/AuditCycleList.jsx";
import AuditCycleForm from "./audit_cycle/AuditCycleForm.jsx";
import AuditCycleCopyForm from "./audit_cycle/AuditCycleCopyForm.jsx";
import AuditCycleDetails from "./audit_cycle/AuditCycleDetails.jsx";
import AuditAlignmentFactors from "./audit_cycle/AuditAlignmentFactors.jsx";
import DetailsFromClient from "./audit_cycle/DetailsFromClient.jsx";
import GuidelineAttachment from "./audit_cycle/GuidelineAttachment.jsx";
import ReferenceAttachment from "./audit_cycle/ReferenceAttachment.jsx";
import AuditCyclePaymentList from "./AuditCyclePaymentList.jsx";
import AuditCycleModeratorSummary from "./audit_cycle/AuditCycleModeratorSummary.jsx";
import PostApprovalDescriptionForm from "./PostApprovalDescriptionForm.jsx";
import EligibilityForAuditors from "./EligibilityForAuditors.jsx";
import CheckPoints from "./CheckPoints.jsx";
import ProofsTag from "./ProofsTag.jsx";
import OpportunityRecordList from "./OpportunityRecordList.jsx";
import OpportunityRecordForm from "./OpportunityRecordForm.jsx";

import SectionAddForm from "./questionnaire/SectionAddForm.jsx";
import SectionEditForm from "./questionnaire/SectionEditForm.jsx";
import SectionProofTag from "./questionnaire/SectionProofTag.jsx";
import SectionList from "./questionnaire/SectionList.jsx";
import SectionCopyForm from "./questionnaire/SectionCopyForm.jsx";

import QuestionForm from "./questionnaire/QuestionForm.jsx";

import AuditList from "./AuditList.jsx";
import AuditCopyForm from "./AuditCopyForm.jsx";
import AuditForm from "./AuditForm.jsx";

// import AuditStoreList from "./AuditStoreList.jsx";
import AuditStoreList from "./AuditStoreListNew.jsx";
import AuditStoreQARatingForm from "./AuditStoreQARatingForm.jsx";
import AuditStoreDetails from "./AuditStoreDetails.jsx";
import AuditStoreReport from "./AuditStoreReport.jsx";
import AuditStoreEarningsPerAuditForm from "./audit_store/AuditStoreEarningsPerAuditForm.jsx";
import AuditStoreReimbursementForm from "./audit_store/AuditStoreReimbursementForm.jsx";
import FailReportMessageForm from "./audit_store/FailReportMessageForm.jsx";
import AuditStoreReportAttributeForm from "./audit_store/AuditStoreReportAttributeForm.jsx";

import AuditFiatAssignForm from "./AuditFiatAssignForm.jsx";

import ApplicationApproveForm from "./application/ApplicationApproveForm.jsx";
import ApplicationRejectForm from "./application/ApplicationRejectForm.jsx";

import ModeratorSummary from "./moderator/ModeratorSummary.jsx";
import ModeratorIndex from "./moderator/ModeratorIndex.jsx";
import ModeratorList from "./moderator/ModeratorList.jsx";
import ModeratorForm from "./moderator/ModeratorForm.jsx";
import ModeratorReportList from "./moderator/ModeratorReportList.jsx";
import AuditCycleModeratorList from "./AuditCycleModeratorList.jsx";
import AuditCycleModeratorAssignForm from "./AuditCycleModeratorAssignForm.jsx";

import ManagerForm from "./manager/ManagerForm.jsx";
import ManagerList from "./manager/ManagerList.jsx";

import TrainerForm from "./trainer/TrainerForm.jsx";
import TrainerList from "./trainer/TrainerList.jsx";

import ClientTrainerList from "./client_trainer/ClientTrainerList.jsx";
import ClientTrainerForm from "./client_trainer/ClientTrainerForm.jsx";

import ClientRequirementsList from "./client_requirement/ClientRequirementsList.jsx";
import ClientRequirementsForm from "./client_requirement/ClientRequirementsForm.jsx";

import ProofTagList from "./proof_tag/ProofTagList.jsx";
import ProofTagForm from "./proof_tag/ProofTagForm.jsx";
import ProofClientList from "./proof_tag/ProofClientList.jsx";

import ReportList from "./reports/ReportList.jsx";
import AuditorPaymentReport from "./reports/AuditorPaymentReport.jsx";
import BillingReport from "./reports/BillingReport.jsx";
import ProfitablityReport from "./reports/ProfitablityReport.jsx";
import ProjectCostReport from "./reports/ProjectCostReport.jsx";
import MonthOnMonthPNL from "./reports/MonthOnMonthPNL.jsx";
import ManagerWiseProfitibilityReport, { ManagerReportModel } from "./reports/ManagerWiseProfitibilityReport.jsx";
import ClientWiseProfitibilityReport from "./reports/ClientWiseProfitibilityReport.jsx";
import QAReport from "./reports/QAReport.jsx";
import ChargePerAuditForm from "./ChargePerAuditForm.jsx";
import SystemCostForm from "./SystemCostForm.jsx";
import AuditStoreAuditorRatingForm from "./audit_store/AuditStoreAuditorRatingForm.jsx";
import { ProjectAnalyticsCycleWise, ProjectAnalyticsMonthWise } from "./reports/analytics/ProjectAnalytics.jsx";
import AnalyticDetails from "./reports/analytics/AnalyticDetails.jsx";
import TrainingReport from "./reports/TrainingReport.jsx";
import AdminDashboard from "./dashboard/AdminDashboard.jsx";
import ActiveCustomer from "./dashboard/ActiveCustomer.jsx";
import TaxList from "./dashboard/tax/TaxList.jsx";
import TaxForm from "./dashboard/tax/TaxForm.jsx";
import AllSolutionList from "./dashboard/allSolutions/AllSolutionList.jsx";
import AllSolutionForm from "./dashboard/allSolutions/AllSolutionForm.jsx";
import AllOrder from "./dashboard/orderes/AllOrder.jsx";
import ActiveOrders from "./dashboard/orderes/ActiveOrders.jsx";
import DraftOrder from "./dashboard/orderes/DraftOrder.jsx";
import CompleteOrder from "./dashboard/orderes/CompleteOrder.jsx";
import CategoryList from "./dashboard/category/CategoryList.jsx";
import CategoryForm from "./dashboard/category/CategoryForm.jsx";
import ArchivedSolution from "./dashboard/archievedsolution/ArchievedSolution.jsx";
import QuestionList from "./dashboard/questiones/QuestionList.jsx";
import DashQuestionForm from "./dashboard/questiones/DashQuestionForm.jsx";
import DashProofsTags from "./dashboard/prooftags/DashProofTags.jsx";
import DetailsForm from "./dashboard/details/DetailsForm.jsx";
import SolutionAttachmentUploadBox from "./dashboard/attachments/SolutionAttachmentUploadBox.jsx";
import CategoryAttachmentUploadBox from "./dashboard/category/CategoryAttachmentUploadBox.jsx";
import QAReportPanel from "./reports/QAReportPanel.jsx";
import QAPerformance from "./reports/QAPerformance.jsx";
import QuestionnaireImportForm from "./questionnaire/QuestionnaireImportForm.jsx";
import ManagerAddCountry from "./manager/ManagerAddCountry.jsx";
import ClientQaList from "./client_qa_listing/ClientQaList.jsx";
import ClientQaForm from "./client_qa_listing/ClientQaForm.jsx";
import SectionPreview from "./questionnaire/SectionPreview.jsx";
import TrainerIndex from "./trainer/TrainerIndex.jsx";
import TrainerReportList from "./trainer/TrainerReportList.jsx";
import TrainerSummary from "./trainer/TrainerSummary.jsx";
import ClientDashboardVisibilityList from "./client_dashboard_visibility/ClientDashboardVisibilityList.jsx";
import ClientDashboardVisibilityForm from "./client_dashboard_visibility/ClientDashboardVisibilityForm.jsx";
import AuditCycleAuditorExecutionsummary from "./AuditCycleAuditorExecutionsummary.jsx";

const Routes = () => (
	<Router history={hashHistory}>
		<Route path="/" component={App}>
			<IndexRoute component={Dashboard} />

			<Route path="admindashboard" component={AdminDashboard}>
				<Route path="activecustomer" component={ActiveCustomer} />
				<Route path="category" component={CategoryList}>
					<Route path="add" component={CategoryForm} />
					<Route path=":categoryId/edit" component={CategoryForm} />
					<Route path=":categoryId/attachment" component={CategoryAttachmentUploadBox} />
				</Route>
				<Route path="tax" component={TaxList}>
					<Route path="add" component={TaxForm} />
					<Route path=":taxId/edit" component={TaxForm} />
				</Route>
				<Route path="solution" component={AllSolutionList}>
					<Route path="add" component={AllSolutionForm} />
					<Route path=":solutionId/edit" component={AllSolutionForm} />
					<Route path=":solutionId/question" component={QuestionList}>
						<Route path="add" component={DashQuestionForm} />
						<Route path=":questionId/edit" component={DashQuestionForm} />
					</Route>
					<Route path=":solutionId/prooftags" component={DashProofsTags} />
					<Route path=":solutionId/details" component={DetailsForm} />
					<Route path=":solutionId/details/:detailsId/edit" component={DetailsForm} />
					<Route path=":solutionId/attachment" component={SolutionAttachmentUploadBox} />
				</Route>
				<Route path="archivedsolution" component={ArchivedSolution} />
				<Route path="allorder" component={AllOrder} />
				<Route path="activeorder" component={ActiveOrders} />
				<Route path="draftorder" component={DraftOrder} />
				<Route path="completeorder" component={CompleteOrder} />
			</Route>

			<Route path="client" component={ClientList}>
				<Route path="add" component={ClientForm} />
			</Route>

			<Route path="client/:clientId" component={ClientDetail}>
				<Route path="edit" component={ClientForm} />
				<Route path="store" component={StoreList}>
					<Route path="add" component={StoreForm} />
					<Route path="import" component={StoreImportForm} />
					<Route path=":storeId/edit" component={StoreForm} />
					<Route path=":storeId/assign" component={StoreAssignForm} />
				</Route>
				<Route path="audit_cycle" component={AuditCycleList}>
					<Route path="add" component={AuditCycleForm} />
				</Route>
				<Route path="client_user" component={ClientUserList}>
					<Route path="add" component={ClientUserForm} />
					<Route path=":clientUserId/edit" component={ClientUserForm} />
					<Route path=":clientUserId/assign_stores" component={ClientUserAssignStores} />
				</Route>
				<Route path="client_manager" component={ClientManagerList}>
					<Route path="add" component={ClientManagerForm} />
					<Route path=":clientManagerId/edit" component={ClientManagerForm} />
					<Route path=":clientUserId/delete" component={ClientManagerDelete} />
				</Route>
				<Route path="client_trainer" component={ClientTrainerList}>
					<Route path="add" component={ClientTrainerForm} />
					<Route path=":clientTrainerId/edit" component={ClientTrainerForm} />
				</Route>
				<Route path="client_requirements" component={ClientRequirementsList}>
					<Route path="add" component={ClientRequirementsForm} />
					<Route path=":clientRequirementId/edit" component={ClientRequirementsForm} />
				</Route>
				<Route path="client_qa_listing" component={ClientQaList}>
					<Route path="add" component={ClientQaForm} />
					<Route path=":clientQaId/edit" component={ClientQaForm} />
				</Route>
				<Route path="client_dashboard_visibility" component={ClientDashboardVisibilityList}>
					<Route path="add" component={ClientDashboardVisibilityForm} />
					<Route path="edit" component={ClientDashboardVisibilityForm} />
				</Route>
				<Route path="questionnaire_type" component={QuestionnaireTypeList}>
					<Route path="add" component={QuestionnaireTypeForm} />
					<Route path=":questionnaireTypeId/edit" component={QuestionnaireTypeEditForm} />
				</Route>
			</Route>



			<Route path="audit_cycle/:auditCycleId" component={AuditCycleDetails}>
				<Route path="edit" component={AuditCycleForm} />
				<Route path="copy" component={AuditCycleCopyForm} />
				<Route path="post_approval_description" component={PostApprovalDescriptionForm} />
				<Route path="eligibility" component={EligibilityForAuditors} />
				<Route path="checkpoints" component={CheckPoints} />
				<Route path="proofs_tag" component={ProofsTag} />
				<Route path="audit_charge" component={ChargePerAuditForm} />
				<Route path="system_cost" component={SystemCostForm} />
				<Route path="audit_alignment_factors" component={AuditAlignmentFactors} />
				<Route path="attachment_guideline" component={GuidelineAttachment} />
				<Route path="reference_attachment" component={ReferenceAttachment} />
				<Route path="details_from_client" component={DetailsFromClient} />
				<Route path="questionnaire" component={SectionList}>
					<Route path="section/preview" component={SectionPreview} />
					<Route path="section/import" component={QuestionnaireImportForm} />
					<Route path="section/copy" component={SectionCopyForm} />
					<Route path="section/add" component={SectionAddForm} />
					<Route path="section/:sectionId/edit" component={SectionEditForm} />
					<Route path="section/:sectionId/proof_tag" component={SectionProofTag} />
					<Route path="section/:sectionId/question/add" component={QuestionForm} />
					<Route path="section/:sectionId/question/:questionId/edit" component={QuestionForm} />
					<Route path="section/:sectionId/question/:questionId/delete" component={QuestionForm} />
				</Route>
				<Route path="audit" components={AuditList}>
					<Route path="copy" component={AuditCopyForm} />
					<Route path="add" component={AuditForm} />
					<Route path=":auditId/edit" component={AuditForm} />
					<Route path=":auditId/application/fiat" component={AuditFiatAssignForm} />
					<Route path=":auditId/application/:applicationId/approve" component={ApplicationApproveForm} />
					<Route path=":auditId/application/:applicationId/reject" component={ApplicationRejectForm} />
				</Route>
				<Route path="audit_store" components={AuditStoreList} />
				<Route path="payment" components={AuditCyclePaymentList} />
				<Route path="moderator_summary" components={AuditCycleModeratorSummary} />
				<Route path="moderator" components={AuditCycleModeratorList}>
					<Route path="assign" component={AuditCycleModeratorAssignForm} />
				</Route>
				<Route path="opportunity_notification" components={OpportunityRecordList}>
					<Route path="schedule" component={OpportunityRecordForm} />
				</Route>
				<Route path="auditor_execution_summary" components={AuditCycleAuditorExecutionsummary} />
			</Route>

			<Route path="audit_store/:auditStoreId" components={AuditStoreDetails}>
				<Route path="report" components={AuditStoreReport} />
				<Route path="qa_rating" components={AuditStoreQARatingForm} />
				<Route path="earnings_per_audit" component={AuditStoreEarningsPerAuditForm} />
				<Route path="reimbursement" component={AuditStoreReimbursementForm} />
				<Route path="fail_report_message" component={FailReportMessageForm} />
				<Route path="report_attribute/:reportAttributeJsonId" component={AuditStoreReportAttributeForm} />
				<Route path="auditor_rating" component={AuditStoreAuditorRatingForm} />
			</Route>

			<Route path="auditor" component={AuditorList} />
			<Route path="auditor/:auditorId" component={AuditorDetailsPage}>
				<Route path="details" component={AuditorDetails}>
					<Route path="preferences/edit" component={PreferencesForm} />
					<Route path="auditor_rating/edit" component={AuditorRatingForm} />
				</Route>
				<Route path="applications" component={AuditorApplicationList} />
				<Route path="reports" component={AuditorReportList} />
				<Route path="email_log" component={AuditorEmailLog} />
				<Route path="id_proof" component={AuditorIdProof} />
				<Route path="payment" component={AuditorPayment} />
				<Route path="referral" component={AuditorReferralList} />
			</Route>

			<Route path="agency_user" component={AgencyUserSearch} />
			<Route path="agency_user/:userId" component={AgencyUserDetails} />

			<Route path="country" component={CountryList}>
				<Route path=":countryId/state" component={StateList}>
					<Route path=":stateId/city" component={CityList} />
				</Route>
			</Route>

			<Route path="moderator" component={ModeratorIndex}>
				<Route path="summary" component={ModeratorSummary}>
					<Route path=":userId/reportlist" component={ModeratorReportList} />
				</Route>
				<Route path="list" component={ModeratorList}>
					<Route path="add" component={ModeratorForm} />
					<Route path=":userId/edit" component={ModeratorForm} />
				</Route>
			</Route>
			<Route path="manager" component={ManagerList}>
				<Route path=":userId/addcountry" component={ManagerAddCountry} />
				<Route path="add" component={ManagerForm} />
				<Route path=":userId/edit" component={ManagerForm} />
			</Route>
			{/* <Route path="trainer" component={TrainerList}>
				<Route path="add" component={TrainerForm} />
				<Route path=":userId/edit" component={TrainerForm} />
			</Route> */}
			<Route path="trainer" component={TrainerIndex}>
				<Route path="summary" component={TrainerSummary}>
					<Route path=":userId/reportlist" component={TrainerReportList} />
				</Route>
				<Route path="list" component={TrainerList}>
					<Route path="add" component={TrainerForm} />
					<Route path=":userId/edit" component={TrainerForm} />
				</Route>
			</Route>
			<Route path="reports" component={ReportList}>
				<Route path="profitablity" component={ProfitablityReport}></Route>
				<Route path="auditor_payment" component={AuditorPaymentReport}></Route>
				<Route path="billing" component={BillingReport}></Route>
				<Route path="project_cost" component={ProjectCostReport}></Route>
				<Route path="monthly_pnl" component={MonthOnMonthPNL}></Route>
				<Route path="manager_profit" component={ManagerWiseProfitibilityReport}>
					<Route path=":managerId/:month/:year/audit_cycle" component={ManagerReportModel}></Route>
				</Route>
				<Route path="client_profitability" component={ClientWiseProfitibilityReport}></Route>
				<Route path="qa_report" component={QAReport}></Route>
				<Route path="qa_report_panel" component={QAReportPanel}></Route>
				<Route path="qa_performance" component={QAPerformance}></Route>
			</Route>
			<Route path="analytics" component={AnalyticDetails}>
				<Route path="project_cycle_wise" component={ProjectAnalyticsCycleWise} />
				<Route path="project_month_wise" component={ProjectAnalyticsMonthWise} />
			</Route>
			<Route path="training" components={TrainingReport} />
			<Route path="proof_tag" component={ProofTagList}>
				<Route path="add" component={ProofTagForm} />
				<Route path=":proof_tag_id/edit" component={ProofTagForm} />
				<Route path=":proof_tag_id/client" component={ProofClientList} />
			</Route>

		</Route>

	</Router>
);

export default Routes;
