import React from "react";
import PropTypes from "prop-types";
import * as ReactRedux from "react-redux";
import { Link } from "react-router";

import Alert from "react-s-alert";

import Datetime from "react-datetime";

import moment from "moment";
import { momentDateFormat, url }  from "../../../config.js";

import { auditStorePropType }  from "../prop_types";

import { fetchAuditStore,
	completeAuditStore,
	qaOkAuditStore,
	withdrawAuditStore,
	submitAuditStore,
	unSubmitAuditStore,
	updateAuditStore,
	uncompleteAuditStore,
	acceptAuditStore,
	rejectAuditStore,
	pmRevertAuditStore,
} from "../actions/audit_store.js";
import { setAuditDate } from "../service/audit_store.js";

import { Calendar, Retweet, King, File, Download, ThumbsDown } from "../../components/Icons.jsx";
import DropDown, { DropDownDivider } from "../../components/DropDown.jsx";
import Loading from "../../components/Loading.jsx";
import AuditStoreStatusLabel from "../../components/AuditStoreStatusLabel.jsx";
import AuditStoreRating from "../../components/AuditStoreRating.jsx";
import MarkdownViewer from "../../components/MarkdownViewer.jsx";

import { getAuditType } from "../../utils.js";

import AttachmentDisplayBox from "./AttachmentDisplayBox.jsx";
import ReportSummary from "./ReportSummary.jsx";
import AuditorNameDisplay from "./AuditorNameDisplay.jsx";
import AuditStoreReportAttributesTable from "./audit_store/AuditStoreReportAttributesTable.jsx";

export class AuditStoreDetails extends React.Component{
	static propTypes = {
		dispatch: PropTypes.func.isRequired,
		params: PropTypes.shape({
			auditStoreId: PropTypes.string.isRequired,
		}),
		auditStore: auditStorePropType,
		errors: PropTypes.shape({
			non_field_errors: PropTypes.array,
		}),
		children: PropTypes.node,
	};

	constructor(props){
		super(props);
		this.state = {
			auditDateLoading: false
		};
	}

	componentDidMount(){
		this.props.dispatch(fetchAuditStore(this.props.params.auditStoreId));
	}
	withdrawButtonClicked = () => {
		this.props.dispatch(withdrawAuditStore(this.props.params.auditStoreId)).then(()=>{
			Alert.success("REPORT WITHDRAWN");
		});
	};
	qaOkButtonClicked = () => {
		this.props.dispatch(qaOkAuditStore(this.props.params.auditStoreId)).then(()=>{
			Alert.success("REPORT FORWARDED TO PM REVIEW");
		});
	};
	pmRevertButtonClicked = () => {
		this.props.dispatch(pmRevertAuditStore(this.props.params.auditStoreId)).then(()=>{
			Alert.success("REPORT MOVED BACK TO QA");
		});
	};
	completeButtonClicked = () => {
		this.props.dispatch(completeAuditStore(this.props.params.auditStoreId)).then(()=>{
			Alert.success("REPORT IN CLIENT REVIEW");
		});
	};
	submitButtonClicked = () => {
		this.props.dispatch(submitAuditStore(this.props.params.auditStoreId)).then(()=>{
			Alert.success("REPORT SUBMITTED");
		});
	};
	unSubmitButtonClicked = () => {
		this.props.dispatch(unSubmitAuditStore(this.props.params.auditStoreId)).then(()=>{
			Alert.success("REPORT Un SUBMITTED");
		});
	};
	uncompleteButtonClicked = () => {
		this.props.dispatch(uncompleteAuditStore(this.props.params.auditStoreId)).then(()=>{
			Alert.success("REPORT Un COMPLETED");
		});
	};
	acceptButtonClicked = () => {
		this.props.dispatch(acceptAuditStore(this.props.params.auditStoreId)).then(()=>{
			Alert.success("REPORT ACCEPTED");
		});
	};
	rejectButtonClicked = () => {
		this.props.dispatch(rejectAuditStore(this.props.params.auditStoreId)).then(()=>{
			Alert.success("REPORT REJECTED");
		});
	};
	auditDateChanged = (momentDate) => {
		this.setState({auditDateLoading: true});
		setAuditDate(this.props.auditStore.id, momentDate.format("YYYY-MM-DD")).then((auditStore) => {
			this.props.dispatch(updateAuditStore(auditStore));
			this.setState({auditDateSuccess: true, auditDateError: false});
			Alert.success("AUDIT DATE CHANGED");
		}, () => {
			this.setState({auditDateSuccess: false, auditDateError: true});
			Alert.warning("AUDIT DATE INVALID");
		}).always(() => {
			this.setState({auditDateLoading: false});
		});
	};
	isSummaryEditable = () => {
		return this.props.auditStore.status === "SUBMITTED" || this.props.auditStore.status === "PM_REVIEW";
	};
	render(){
		if(! this.props.auditStore){
			return <Loading/>;
		}

		let auditDateElement = moment(this.props.auditStore.audit_date).format(momentDateFormat);

		let moreOptionsDropdown;
		let completeButton, unSubmitButton, submitButton, uncompleteButton, acceptButton, rejectButton, qaOkButton, pmRevertButton;
		if (this.props.auditStore.status === "ACKNOWLEDGED"){
			submitButton = (<button onClick={this.submitButtonClicked} type="button" className="btn btn-primary">
				Force Submit
			</button>);
		}
		if(this.props.auditStore.status === "SUBMITTED"){
			unSubmitButton = (<button onClick={this.unSubmitButtonClicked} type="button" className="btn btn-default">
				Revert to Auditor
			</button>);
			qaOkButton = (<button onClick={this.qaOkButtonClicked} type="button" className="btn btn-primary">
				Forward to PM
			</button>);
		}
		if (this.props.auditStore.status === "PM_REVIEW"){
			pmRevertButton = (<button onClick={this.pmRevertButtonClicked} type="button" className="btn btn-default">Revert to QA</button>);
			completeButton = (<button onClick={this.completeButtonClicked} type="button" className="btn btn-primary">Forward to Client</button>);
		}
		if (this.props.auditStore.status === "COMPLETED"){
			uncompleteButton = (<button onClick={this.uncompleteButtonClicked} type="button" className="btn btn-default">Revert from Client</button>);
			acceptButton = (<button onClick={this.acceptButtonClicked} type="button" className="btn btn-success">Accept</button>);
			rejectButton = (<button onClick={this.rejectButtonClicked} type="button" className="btn btn-danger">Reject</button>);
		}
		if(this.props.auditStore.status === "ASSIGNED" ||
			this.props.auditStore.status === "ACKNOWLEDGED" ||
			this.props.auditStore.status === "SUBMITTED" ||
			this.props.auditStore.status === "PM_REVIEW"
		){
			moreOptionsDropdown = (<div className="btn-group">
				<button type="button" className="btn btn-default"
					onClick={(e)=>{e.stopPropagation(); this.moreOptionsDropdown && this.moreOptionsDropdown.toggle();}}>
					More Options
				</button>
				<DropDown ref={(d) => this.moreOptionsDropdown=d}>
					<li>
						<ThumbsDown/><Link to={`/audit_store/${this.props.auditStore.id}/fail_report_message`}>Fail Report</Link>
					</li>
					<DropDownDivider/>
					<li>
						<a onClick={this.withdrawButtonClicked}>
							Withdraw Report
						</a>
					</li>
				</DropDown>
			</div>);
		}
		if(this.props.auditStore.status === "SUBMITTED" || this.props.auditStore.status === "PM_REVIEW"){
			let hasAuditDateError = this.state.auditDateError ? "has-error" : "";
			let hasAuditDateSuccess = this.state.auditDateSuccess ? "has-success" : "";
			auditDateElement = (<div className={"input-group " + hasAuditDateError + hasAuditDateSuccess}>
				<span className="input-group-addon"><Calendar/></span>
				<Datetime
					inputProps={{className:"form-control"}}
					disabled={this.state.auditDateLoading}
					timeFormat={false}
					dateFormat={momentDateFormat}
					closeOnSelect={true}
					onChange={this.auditDateChanged}
					value={this.props.auditStore.audit_date}
				/>
			</div>);
		}
		let detailsElement = (<div className="panel-body">
			<MarkdownViewer markdown={this.props.auditStore.audit.post_approval_description || ""}/>
			<MarkdownViewer markdown={this.props.auditStore.audit.audit_cycle.post_approval_description || ""}/>
		</div>);

		let errorFirst;
		if(this.props.errors && this.props.errors.non_field_errors){
			errorFirst = (<span>{this.props.errors.non_field_errors[0]}</span>);
		}

		return (
			<div>
				<ol className="breadcrumb">
					<li><Link to="/client">Clients</Link></li>
					<li><Link to={`/client/${this.props.auditStore.audit.audit_cycle.client.id}/audit_cycle`}><King/> {this.props.auditStore.audit.audit_cycle.client.name}</Link></li>
					<li><Link to={`/audit_cycle/${this.props.auditStore.audit.audit_cycle.id}/audit_store`}><Retweet/> {this.props.auditStore.audit.audit_cycle.name}</Link></li>
					<li className="active"><File/> {this.props.auditStore.audit.store.name}</li>
				</ol>
				<h2 className="page-header">
					<File/> Audit Report - {this.props.auditStore.id}
					<div className="pull-right">
						<a className="btn btn-default" href={url.api_base_path + "manager/client/" + this.props.auditStore.audit.store.client.id + "/audit_store/" + this.props.auditStore.id + "/xlsx_report"}>
							<Download/> Excel Report
						</a>
						&nbsp;
						{moreOptionsDropdown}
					</div>
				</h2>
				<div className="row">
					<div className="col-md-4">
						<div className="panel panel-default">
							<div className="panel-heading">
								<h4 className="panel-title">Audit Details</h4>
							</div>
							<table className="table table-striped">
								<tbody>
									<tr>
										<td className="text-right">Client:</td>
										<th>{this.props.auditStore.audit.audit_cycle.client.name}</th>
									</tr>
									<tr>
										<td className="text-right">Store:</td>
										<th>{this.props.auditStore.audit.store.name}</th>
									</tr>
									<tr>

										<td className="text-right">Address:</td>
										<th>{`${this.props.auditStore.audit.store.address}, ${this.props.auditStore.audit.store.city.name}`}</th>
									</tr>
									<tr>
										<td className="text-right">Type:</td>
										<th>{getAuditType(this.props.auditStore.audit.audit_cycle.type)}</th>
									</tr>
									<tr>
										<td className="text-right">Fees:</td>
										<th>
											₹ {this.props.auditStore.earnings_per_audit || this.props.auditStore.audit.earnings_per_audit} (<Link to={`/audit_store/${this.props.auditStore.id}/earnings_per_audit`}>change</Link>)
										</th>
									</tr>
									<tr>
										<td className="text-right">Reimbursement upto:</td>
										<th>
											₹ {this.props.auditStore.reimbursement || this.props.auditStore.audit.reimbursement} (<Link to={`/audit_store/${this.props.auditStore.id}/reimbursement`}>change</Link>)
										</th>
									</tr>
									<tr>
										<td className="text-right">Auditor:</td>
										<td><AuditorNameDisplay user={this.props.auditStore.user}/></td>
									</tr>
									<tr>
										<td className="text-right">Audit Date:</td>
										<th>{auditDateElement}</th>
									</tr>
									<tr>
										<td className="text-right">Status:</td>
										<th><AuditStoreStatusLabel status={this.props.auditStore.status}/></th>
									</tr>
									<tr>
										<td className="text-right">Rating:</td>
										<th>
											<AuditStoreRating rating={this.props.auditStore.qa_rating}/> (<Link to={`/audit_store/${this.props.auditStore.id}/qa_rating`}>change</Link>)
										</th>
									</tr>
								</tbody>
								<AuditStoreReportAttributesTable auditStoreId={this.props.auditStore.id}/>
							</table>
							<div className="panel-footer text-right">
								{errorFirst}
								{submitButton}&nbsp;{unSubmitButton}&nbsp;{qaOkButton}&nbsp;{pmRevertButton}&nbsp;{completeButton}&nbsp;{uncompleteButton}&nbsp;{acceptButton}&nbsp;{rejectButton}
							</div>
						</div>
					</div>
					<div className="col-md-8">
						{detailsElement}
					</div>
				</div>
				<AttachmentDisplayBox auditStoreId={this.props.params.auditStoreId}/>
				<ReportSummary auditStoreId={parseInt(this.props.params.auditStoreId)} editable={this.isSummaryEditable()}/>
				{this.props.children}
			</div>
		);
	}
}

var mapStoreToProps = function(store, ownProps){
	return {
		auditStore: store.auditStores[ownProps.params.auditStoreId],
		errors: store.errors
	};
};

export default ReactRedux.connect(mapStoreToProps)(AuditStoreDetails);
