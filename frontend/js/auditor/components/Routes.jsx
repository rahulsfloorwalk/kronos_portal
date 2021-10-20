import React from "react";
import PropTypes from "prop-types";
import { Provider } from "react-redux";
import { Router, Route, IndexRoute, hashHistory } from "react-router";

import ReactGA from "react-ga";

import App from "./App.jsx";
import Dashboard from "./Dashboard.jsx";
import DetailsPage from "./DetailsPage.jsx";

import ClientList from "./ClientList.jsx";
import AuditList from "./AuditList.jsx";
import AuditApplyForm from "./AuditApplyForm.jsx";
import AuditCancelForm from "./AuditCancelForm.jsx";

import AuditStoreList from "./AuditStoreList.jsx";
import WithdrawReport from "./WithdrawReport.jsx";
import ReportConcern from "./ReportConcern.jsx";
import PaymentConcern from "./PaymentConcern.jsx";
import AuditStoreDetails from "./AuditStoreDetails.jsx";
import PerformAudit from "./PerformAudit.jsx";

import ProfileInfoForm from "./ProfileInfoForm.jsx";
import BankInfoForm from "./BankInfoForm.jsx";
import AdditionalInfoForm from "./AdditionalInfoForm.jsx";
import PreferencesForm from "./PreferencesForm.jsx";
import MobileNumberForm from "./MobileNumberForm.jsx";

import ToSAcceptForm from "./ToSAcceptForm.jsx";

import PaymentList from "./PaymentList.jsx";
// import ReferralList from "./ReferralList.jsx";
import ShopperGuide from "./ShopperGuide.jsx";
import ShopperGuideVideos from "./ShopperGuideVideos.jsx";
import ShopperGuideBlogs from "./ShopperGuideBlogs.jsx";
import ShopperGuidePodcasts from "./ShopperGuidePodcasts.jsx";
import ShopperGuideSocialSnippets from "./ShopperGuideSocialSnippets.jsx";
import FullTimeOpportunity from "./FullTimeOpportunity.jsx";
import ContentNinja from "./ContentNinja.jsx";

function logPageView() {
	//console.log(window.location.pathname, window.location.hash);
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
					<Route path="preferences/edit" component={PreferencesForm}/>
					<Route path="mobile_number/edit" component={MobileNumberForm}/>
				</Route>
				<Route path="audit" component={ClientList}/>
				<Route path="audit/cycle/:auditCycleId" component={AuditList}>
					<Route path="audit/:auditId">
						<Route path="apply" component={AuditApplyForm}/>
						<Route path="cancel" component={AuditCancelForm}/>
					</Route>
				</Route>
				<Route path="audit_store" component={AuditStoreList}/>
				<Route path="audit_store/:auditStoreId/withdraw" component={WithdrawReport}/>
				<Route path="audit_store/:auditStoreId/report_concern" component={ReportConcern}/>
				<Route path="audit_store/:auditStoreId/section" component={AuditStoreDetails}>
					<Route path="perform_audit" component={PerformAudit}/>
					<Route path="report_concern" component={ReportConcern}/>
				</Route>
				<Route path="payment" component={PaymentList}/>
				<Route path="payment/:paymentId/payment_concern" component={PaymentConcern}/>
				{/* <Route path="referral" component={ReferralList}/> */}
				<Route path="full_time_opportunity" component={FullTimeOpportunity} />
				<Route path="content_ninja" component={ContentNinja} />
				<Route path="tos_accept" component={ToSAcceptForm}/>
				<Route path="shopper_guide" component={ShopperGuide}>
					<Route path="videos" component={ShopperGuideVideos}/>
					<Route path="blog" component={ShopperGuideBlogs}/>
					<Route path="podcast" component={ShopperGuidePodcasts}/>
					<Route path="social_snippets" component={ShopperGuideSocialSnippets}/>
				</Route>
			</Route>
		</Router>
	</Provider>
);

Routes.propTypes = {
	store: PropTypes.object,
};

export default Routes;
