import React from "react";
import PropTypes from "prop-types";
import * as ReactRedux from "react-redux";
import { Link } from "react-router";
import Alert from "react-s-alert";
import moment from "moment";
import { momentDateFormat }  from "../../../config.js";

import { fetchAuditStore, acknowledgeAuditStore, submitAuditStore, arrangeAttachment,FetchGuidlineByAuditStore } from "../actions/audit_store.js";

import Loading from "../../components/Loading.jsx";
import AuditStoreStatusLabel from "../../components/AuditStoreStatusLabel.jsx";

import AttachmentUploadBox from "./AttachmentUploadBox.jsx";
import ReportSummary from "./ReportSummary.jsx";
import MarkdownViewer from "../../components/MarkdownViewer.jsx";

import SectionList from "./questionnaire/SectionList.jsx";

import { getAuditType } from "../../utils.js";
import { auditStorePropType } from "../prop_types";

class AuditStoreDetails extends React.Component {
	static propTypes = {
		dispatch: PropTypes.func.isRequired,
		params: PropTypes.shape({
			auditStoreId: PropTypes.string.isRequired,
		}),
		auditStore: auditStorePropType,
		children: PropTypes.node,
	};

	state = {
		submitMessage : "",
		submitStatus: "",
		showErrors: false,
		guideline:""
	};

	componentDidMount() {
		this.props.dispatch(fetchAuditStore(this.props.params.auditStoreId));
		FetchGuidlineByAuditStore(this.props.params.auditStoreId).then((guideline)=> this.setState({guideline:guideline}));
	}

	submitButtonClicked = () => {
		this.setState({showErrors: false,submitMessage: ""});
		var promise = this.props.dispatch(submitAuditStore(this.props.params.auditStoreId));
		promise.then(() => {
			this.setState({
				submitMessage : "Report submitted successfully",
				submitStatus: "success",
			});
			Alert.success("Report submitted successfully");
		},(err) => {
			this.setState({
				submitMessage : err.responseJSON.non_field_errors[0],
				submitStatus: "danger",
				showErrors: true,
			});
			Alert.error(err.responseJSON.non_field_errors[0], {timeout:7000});
		});
	};

	acknowledgeButtonClicked = () => {
		var promise = this.props.dispatch(acknowledgeAuditStore(this.props.params.auditStoreId));
		promise.then(() => {
			this.setState({
				submitMessage : "You have agreed to conduct the audit. Audit is now in progress.",
				submitStatus: "success",
			});
		},(err) => {
			this.setState({
				submitMessage : err.responseJSON.non_field_errors[0],
				submitStatus: "danger",
				showErrors: true,
			});
		});
	};

	isReportEditable = () => {
		return this.props.auditStore && this.props.auditStore.status === "ACKNOWLEDGED";
	};

	arrangeAttachmentByProofTag = () => {
		arrangeAttachment(this.props.params.auditStoreId).then(() => {
			location.reload();
		});
	};
	openPDFInNewTab = () => {
		const { guideline } = this.state;
		window.open(guideline, "_blank");
	};
	render() {
		if(! this.props.auditStore){
			return <Loading/>;
		}

		let submitAuditButton, acknowledgeButton, performAuditButton, concernButton, attachmentArrangeButton;
		if(this.props.auditStore.status === "ASSIGNED"){
			acknowledgeButton = (
				<span>
					<button onClick={this.acknowledgeButtonClicked} type="button" className="btn btn-primary btn-lg">
				Agree
					</button>
				&nbsp;
				&nbsp;
					{/* <big>I have read the <b>instructions</b>, <b>questionnaire</b> and agree to conduct the audit.</big> */}
					<big>Click on the <b>Agree</b> button and start filling out the <b>Report.</b></big>
				</span>);
			if(this.props.auditStore.get_date_diff > 0){
				performAuditButton = (
					<Link to={`audit_store/${this.props.params.auditStoreId}/section/perform_audit`}><button className="btn btn-primary pull-right" style={{marginLeft: "1%"}} type="button">Performed the Audit?</button></Link>
				);
			}
			concernButton = (<Link to={`audit_store/${this.props.auditStore.id}/section/report_concern`} className="btn btn-primary pull-right">Having Trouble ?</Link>);
		}
		if(this.props.auditStore.status === "ACKNOWLEDGED"){
			submitAuditButton = (<button onClick={this.submitButtonClicked} type="button" className="btn btn-primary btn-lg">Submit Report</button>);
			if(this.props.auditStore.get_date_diff > 0){
				performAuditButton = (
					<Link to={`audit_store/${this.props.params.auditStoreId}/section/perform_audit`}><button className="btn btn-primary pull-right" style={{marginLeft: "1%"}} type="button">Performed the Audit?</button></Link>
				);
			}
			concernButton = (<Link to={`audit_store/${this.props.auditStore.id}/section/report_concern`} className="btn btn-primary pull-right">Having Trouble ?</Link>);
			// attachmentArrangeButton = <button className="btn btn-lg btn-primary" style={{marginLeft:"10px"}} onClick={this.arrangeAttachmentByProofTag}>Send proofs to relevant sections</button>;
		}

		const earnings_per_audit = this.props.auditStore.earnings_per_audit || this.props.auditStore.audit.earnings_per_audit;
		const fees = earnings_per_audit ? <b> ₹ {earnings_per_audit}, </b> : "";
		const reimbursement = this.props.auditStore.reimbursement || this.props.auditStore.audit.reimbursement;
		const reimb = reimbursement ? <span>Reimbursement upto: <b>₹ {reimbursement}</b></span> : "";

		const manager_info_list = this.props.auditStore.manager_info_list;
		let mngr_cntct = "";
		if (manager_info_list && manager_info_list.length > 0) {
			const contactString = manager_info_list.map(manager => `${manager.name} (${manager.mobile})`).join(", ");
			mngr_cntct = <span><b>{contactString}</b></span>;
		}

		// const manager_name_list = this.props.auditStore.manager_name_list;
		// let mngr_name = "";
		// if (manager_name_list && manager_name_list.length > 0) {
		// mngr_name = (
		// 	<span>
		// 	<b>{manager_name_list.join(', ')}</b>
		// 	</span>
		// );
		// }

		let submitMessageElement = <big><b className={this.state.submitStatus ? "text-" + this.state.submitStatus : ""}>{this.state.submitMessage}</b></big>;

		let buttonPanel = (
			<div className="form-group">
				{acknowledgeButton}{submitAuditButton}{attachmentArrangeButton}&nbsp;&nbsp;{submitMessageElement}
			</div>);

		const support_page_link = this.props.auditStore.audit.audit_cycle.support_page_link;
		const support_button = support_page_link ? <a href={support_page_link} target="_blank" rel="noopener noreferrer" style={{marginRight: "1%"}} className="btn btn-primary pull-right"><span style={{animation: "blink 1s linear infinite",fontWeight:"bold"}}>Need support for {this.props.auditStore.audit.audit_cycle.client.auditor_display_name}?</span></a> : null;

		return (
			<div>
				<div className="row">
					{performAuditButton}{concernButton}{support_button}
				</div>
				<h2 className="page-header"><b>{this.props.auditStore.audit.audit_cycle.client.auditor_display_name}</b> [Report ID: {this.props.params.auditStoreId}]</h2>
				<div className="row">
					<div className="col-md-5">
						<div className="panel panel-default">
							<table className="table table-striped">
								<tbody>
									<tr>
										<td className="text">Type:</td>
										<th>{getAuditType(this.props.auditStore.audit.audit_cycle.type)}</th>
									</tr>
									<tr>
										<td className="text">Store Name:</td>
										<th>{this.props.auditStore.audit.store.name}</th>
									</tr>
									<tr>
										<td className="text">Phone:</td>
										<th>{this.props.auditStore.audit.store.phone}</th>
									</tr>
									<tr>
										<td className="text">Address:</td>
										<th>{this.props.auditStore.audit.store.address}</th>
									</tr>
									<tr>
										<td className="text">Fees:</td>
										<th>{<span>{fees}{reimb}</span>}</th>
									</tr>
									<tr>
										<td className="text">Audit Date:</td>
										<th>{moment(this.props.auditStore.audit_date).format(momentDateFormat)}</th>
									</tr>
									<tr>
										<td className="text">Status:</td>
										<th>{<AuditStoreStatusLabel status={this.props.auditStore.status}/>}
										</th>
									</tr>
									<tr>
										<td className="text">Contacts:</td>
										<th>{mngr_cntct}</th>
									</tr>
									{this.state.guideline && this.state.guideline ?
										<tr>
											<td className="text-right">PDF Guideline:</td>
											<th><button className="btn btn-primary sm" onClick={this.openPDFInNewTab}>Open Guideline</button></th>
										</tr>
										: null}
								</tbody>
							</table>
						</div>
					</div>
					<div className="col-md-7">
						<td className="text-right"style={{ fontSize: "16px", }}><b> Guidelines:-</b></td>
						{ !(! this.props.auditStore.audit.post_approval_description && ! this.props.auditStore.audit.audit_cycle.post_approval_description) ?
							<div className="panel-body" style={{ marginTop: "-20px" }}>
								<MarkdownViewer markdown={this.props.auditStore.audit.post_approval_description || ""}/>
								<MarkdownViewer markdown={this.props.auditStore.audit.audit_cycle.post_approval_description || ""}/>
							</div>
							: null }
					</div>
					<div className="col-md-6">
					</div>

				</div>
				{buttonPanel}
				<AttachmentUploadBox auditStoreId={this.props.params.auditStoreId} editable={this.isReportEditable()}/>
				<ReportSummary audit_store_id={this.props.params.auditStoreId} report_summary={this.props.auditStore.report_summary} editable={this.isReportEditable()} />
				<SectionList auditStoreId={this.props.params.auditStoreId} showErrors={this.state.showErrors} editable={this.isReportEditable()} auditStore={this.props.auditStore}/>
				{buttonPanel}
				{this.props.children}
			</div>
		);
	}
}

var mapStoreToProps = function(store, ownProps){
	return {
		auditStore: store.auditStores[ownProps.params.auditStoreId],
		sections: store.sections
	};
};

export default ReactRedux.connect(mapStoreToProps)(AuditStoreDetails);
