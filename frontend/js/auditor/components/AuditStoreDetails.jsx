import React from "react";
import PropTypes from "prop-types";
import * as ReactRedux from "react-redux";
import { Link } from "react-router";
import Alert from "react-s-alert";
import moment from "moment";
import { momentDateFormat }  from "../../../config.js";

import { fetchAuditStore, acknowledgeAuditStore, submitAuditStore, arrangeAttachment } from "../actions/audit_store.js";

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
	};

	componentDidMount() {
		this.props.dispatch(fetchAuditStore(this.props.params.auditStoreId));
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
					<big>I have read the <b>instructions</b>, <b>questionnaire</b> and agree to conduct the audit.</big>
				</span>);
			if(this.props.auditStore.get_date_diff > 0){
				performAuditButton = (
					<Link to={`audit_store/${this.props.params.auditStoreId}/section/perform_audit`}><button className="btn btn-primary pull-right" style={{marginLeft: "1%"}} type="button">Performed the Audit?</button></Link>
				);
			}
			concernButton = (<Link to={`audit_store/${this.props.auditStore.id}/section/report_concern`} className="btn btn-primary pull-right">Any Concern?</Link>);
		}
		if(this.props.auditStore.status === "ACKNOWLEDGED"){
			submitAuditButton = (<button onClick={this.submitButtonClicked} type="button" className="btn btn-primary btn-lg">Submit Report</button>);
			if(this.props.auditStore.get_date_diff > 0){
				performAuditButton = (
					<Link to={`audit_store/${this.props.params.auditStoreId}/section/perform_audit`}><button className="btn btn-primary pull-right" style={{marginLeft: "1%"}} type="button">Performed the Audit?</button></Link>
				);
			}
			concernButton = (<Link to={`audit_store/${this.props.auditStore.id}/section/report_concern`} className="btn btn-primary pull-right">Any Concern?</Link>);
			// attachmentArrangeButton = <button className="btn btn-lg btn-primary" style={{marginLeft:"10px"}} onClick={this.arrangeAttachmentByProofTag}>Send proofs to relevant sections</button>;
		}

		const earnings_per_audit = this.props.auditStore.earnings_per_audit || this.props.auditStore.audit.earnings_per_audit;
		const fees = earnings_per_audit ? <b>Fees: ₹ {earnings_per_audit}, </b> : "";
		const reimbursement = this.props.auditStore.reimbursement || this.props.auditStore.audit.reimbursement;
		const reimb = reimbursement ? <span>Reimbursement upto: <b>₹ {reimbursement}</b></span> : "";

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
				<h2 className="page-header">Audit Report - [ID: {this.props.params.auditStoreId}]  <b>{this.props.auditStore.audit.audit_cycle.client.auditor_display_name}</b></h2>
				<div className="row">
					<div className="col-md-12">
						<div className="panel panel-default">
							<table className="table table-striped">
								<tbody>
									<tr>
										<td className="text-right">Type:</td>
										<th>{getAuditType(this.props.auditStore.audit.audit_cycle.type)}</th>
									</tr>
									<tr>
										<td className="text-right">Store:</td>
										<th>{this.props.auditStore.audit.store.name}</th>
									</tr>
									<tr>
										<td className="text-right">Phone:</td>
										<th>{this.props.auditStore.audit.store.phone}</th>
									</tr>
									<tr>
										<td className="text-right">Address:</td>
										<th>{this.props.auditStore.audit.store.address}</th>
									</tr>
									<tr>
										<td className="text-right">Fees:</td>
										<th>{<span>{fees}{reimb}</span>}</th>
									</tr>
									<tr>
										<td className="text-right">Audit Date:</td>
										<th>{moment(this.props.auditStore.audit_date).format(momentDateFormat)}</th>
									</tr>
									<tr>
										<td className="text-right">Status:</td>
										<th>{<AuditStoreStatusLabel status={this.props.auditStore.status}/>}
											{this.props.auditStore.status=="SUBMITTED" ?
												<sub>
													<br/>
													<i>
														It usually takes 7 working days for the Quality check, the team may reach out to you in case of any concerns.
													</i>
												</sub>:
												this.props.auditStore.status=="COMPLETED" ?
													<sub>
														<br/>
														<i>
															It may take upto 15 days for the client to review the report. Once, it is reviewed, it will be accepted and payments will be processed.
														</i>
													</sub> :
													this.props.auditStore.status=="ACCEPTED" ?
														<sub>
															<br/>
															<i>
																Congratulations! Your report has been accepted and the payments for this report will be done in 45 days from the month end in your bank account.
															</i>
														</sub>:
														this.props.auditStore.status=="PM_REVIEW" ?
															<sub>
																<br/>
																<i>
																	It may take upto 3 days for the Project Team to review the report. Once, it is reviewed, it will be shared with the client.
																</i>
															</sub>:
															"" }
										</th>
									</tr>
								</tbody>
							</table>
							{ !(! this.props.auditStore.audit.post_approval_description && ! this.props.auditStore.audit.audit_cycle.post_approval_description) ?
								<div className="panel-body">
									<MarkdownViewer markdown={this.props.auditStore.audit.post_approval_description || ""}/>
									<MarkdownViewer markdown={this.props.auditStore.audit.audit_cycle.post_approval_description || ""}/>
								</div>
								: null }
						</div>
					</div>
					<div className="col-md-6">
					</div>
				</div>
				{/* {buttonPanel} */}
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
