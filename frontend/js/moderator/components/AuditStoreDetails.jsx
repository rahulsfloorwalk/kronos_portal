import React from "react";
import PropTypes from "prop-types";
import { Link } from "react-router";

import Datetime from "react-datetime";
import "react-datetime/css/react-datetime.css";


import moment from "moment";
import { momentDateFormat }  from "../../../config.js";

import { findById, qaOk, fail, unsubmit, submit, setAuditDate, setAuditModeratorStatus, setAuditModeratorComment } from "../service/audit_store.js";

import { Calendar, File, Envelope } from "../../components/Icons.jsx";
import Loading from "../../components/Loading.jsx";
import AuditStoreStatusLabel from "../../components/AuditStoreStatusLabel.jsx";
import MarkdownViewer from "../../components/MarkdownViewer.jsx";
import AuditTypeLabel from "../../components/AuditTypeLabel.jsx";
import AuditStoreRating from "../../components/AuditStoreRating.jsx";

import AttachmentBox from "./AttachmentBox.jsx";
import AuditStoreSections from "./AuditStoreSections.jsx";
import AuditorNameDisplay from "./AuditorNameDisplay.jsx";
import ReportSummary from "./ReportSummary.jsx";

export default class AuditStoreDetails extends React.Component{
	static propTypes = {
		params: PropTypes.shape({
			auditStoreId: PropTypes.string.isRequired,
		}).isRequired,
		children: PropTypes.node,
		location: PropTypes.shape({
			pathname: PropTypes.string.isRequired,
		}).isRequired,
	};

	constructor(props){
		super(props);
		this.state = {
			auditStore: null,
			auditDateLoading: false,
			auditDateSuccess: false,
			auditDateError: false,
			errorMessage: "",
		};
	}
	setAuditStore = (auditStore) => {
		this.setState({
			auditStore
		});
	};
	componentDidMount(){
		findById(this.props.params.auditStoreId).then(this.setAuditStore);
	}
	componentWillReceiveProps(nextProps){
		findById(nextProps.params.auditStoreId).then(this.setAuditStore);
	}
	qaOkButtonClicked = () => {
		qaOk(this.props.params.auditStoreId).then(this.setAuditStore, (err) => {
			if(err.responseJSON && err.responseJSON.non_field_errors){
				this.setState({
					errorMessage: err.responseJSON.non_field_errors[0]
				});
			}
		});
	};
	failButtonClicked = () => {
		fail(this.props.params.auditStoreId).then(this.setAuditStore);
	};
	submitButtonClicked = () => {
		submit(this.props.params.auditStoreId).then(this.setAuditStore);
	};
	unSubmitButtonClicked = () => {
		unsubmit(this.props.params.auditStoreId).then(this.setAuditStore);
	};
	auditDateChanged = (momentDate) => {
		this.setState({auditDateLoading: true});
		//FIXME: momentDate#format is not a function
		setAuditDate(this.state.auditStore.id, momentDate.format("YYYY-MM-DD")).then((auditStore) => {
			this.setAuditStore(auditStore);
			this.setState({auditDateSuccess: true, auditDateError: false});
		}, () => {
			this.setState({auditDateSuccess: false, auditDateError: true});
		}).always(() => {
			this.setState({auditDateLoading: false});
		});
	};
	setModeratorStatus = (e) =>{
		setAuditModeratorStatus(this.props.params.auditStoreId,e.target.value).then((auditStore) => {
			this.setState({
				auditStore
			});
		});
	};
	setModeratorComment = (e) => {
		setAuditModeratorComment(this.props.params.auditStoreId,e.target.value);
	};
	render(){
		if(! this.state.auditStore){
			return <Loading/>;
		}
		var paddingStyle={
			paddingBottom:'2%'
		};
		let auditDateElement = moment(this.state.auditStore.audit_date).format(momentDateFormat);

		let failButton, qaOkButton, unSubmitButton, submitButton;
		if (this.state.auditStore.status === "ACKNOWLEDGED"){
			submitButton = (<button onClick={this.submitButtonClicked} type="button" className="btn btn-primary">Force Submit</button>);
		}
		if(this.state.auditStore.status === "ASSIGNED" || this.state.auditStore.status === "ACKNOWLEDGED" || this.state.auditStore.status === "SUBMITTED"){
			failButton = (<button onClick={this.failButtonClicked} type="button" className="btn btn-default pull-right">Fail</button>);
		}
		if(this.state.auditStore.status === "SUBMITTED"){
			unSubmitButton = (<button onClick={this.unSubmitButtonClicked} type="button" className="btn btn-default">Revert to Auditor</button>);
			qaOkButton = (<button onClick={this.qaOkButtonClicked} type="button" className="btn btn-primary">Forward to PM</button>);

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
					value={this.state.auditStore.audit_date}
				/>
			</div>);
		}
		const auditorEmailLink = (<a href={`mailto:${this.state.auditStore.user.email}`}>{this.state.auditStore.user.email}</a>);

		let errorMessageElement = (<span>{this.state.errorMessage}</span>);
		let editable = this.state.auditStore && this.state.auditStore.status === "SUBMITTED";
		
		var selectElement = null;
		var textareaElement = null;
		if (editable){
			selectElement = (
				<select className="form-control" onChange={this.setModeratorStatus} value={this.state.auditStore.moderator_status}>
					<option value="">Select Status</option>
					<option value="MISS_IMAGE">Missing Image</option>
					<option value="MISS_AUDIO">Missing Audio</option>
					<option value="MISS_VIDEO">Missing Video</option>
					<option value="AUDITOR_NOT_RESPONDING">Auditor Not Responding</option>
					<option value="CONTRADICTION">Contradiction</option>
					<option value="NOT_SUFFICIENT_PROOFS">Not Suffiecient Proofs</option>
					<option value="DATE_TIME_MISSING">Date or Time Missing in Image</option>
					<option value="WAITING_FOR_ATTACHMENT">Waiting for Attachment from Auditor</option>
					<option value="FAULTY_REPORT">Faulty Report</option>
				</select>);
			textareaElement = (
				<textarea className="form-control" onBlur={this.setModeratorComment} defaultValue={this.state.auditStore.moderator_comment}></textarea>
			);
		}
		else{
			selectElement = (
				<select className="form-control" onChange={this.setModeratorStatus} value={this.state.auditStore.moderator_status} disabled>
					<option value="">Select Status</option>
					<option value="MISS_IMAGE">Missing Image</option>
					<option value="MISS_AUDIO">Missing Audio</option>
					<option value="MISS_VIDEO">Missing Video</option>
					<option value="AUDITOR_NOT_RESPONDING">Auditor Not Responding</option>
					<option value="CONTRADICTION">Contradiction</option>
					<option value="NOT_SUFFICIENT_PROOFS">Not Suffiecient Proofs</option>
					<option value="DATE_TIME_MISSING">Date or Time Missing in Image</option>
					<option value="WAITING_FOR_ATTACHMENT">Waiting for Attachment from Auditor</option>
					<option value="FAULTY_REPORT">Faulty Report</option>
				</select>
			);

			textareaElement = (
				<textarea className="form-control" onBlur={this.setModeratorComment} defaultValue={this.state.auditStore.moderator_comment} readOnly></textarea>
			);
		}
		return (
			<div>
				{/*
					<ol className="breadcrumb">
						<li><Link to="/">Audit Cycle</Link></li>
						<li><Link to={`/audit_cycle/${this.state.auditStore.audit.audit_cycle.id}/audit_store`}><Retweet/> {this.state.auditStore.audit.audit_cycle.name}</Link></li>
						<li className="active"><File/> {moment(this.state.auditStore.audit_date).format(momentDateFormat)}</li>
					</ol>
				*/}
				<h2 className="page-header">
					{failButton}
					<File/> Audit Report - {this.state.auditStore.id}
				</h2>
				<div className="row">
					<div className="col-md-6">
						<div className="panel panel-default">
							<div className="panel-heading">
								<h4 className="panel-title">Audit Details</h4>
							</div>
							<table className="table table-striped">
								<tbody>
									<tr>
										<td className="text-right">Client:</td>
										<th>{this.state.auditStore.audit.audit_cycle.client.name}</th>
									</tr>
									<tr>
										<td className="text-right">Store:</td>
										<td>
											<b>{this.state.auditStore.audit.store.name}</b><br/>
											<small>{this.state.auditStore.audit.store.address}</small>
										</td>
									</tr>
									<tr>

										<td className="text-right">Address:</td>
										<th>{`${this.state.auditStore.audit.store.address}, ${this.state.auditStore.audit.store.city.name}`}</th>
									</tr>
									<tr>
										<td className="text-right">Type:</td>
										<th><AuditTypeLabel auditType={this.state.auditStore.audit.audit_cycle.type}/></th>
									</tr>
									<tr>
										<td className="text-right">Audit Fees:</td>
										<th>
											₹ {this.state.auditStore.earnings_per_audit || this.state.auditStore.audit.earnings_per_audit} (<Link to={`${this.props.location.pathname}/earnings_per_audit`}>change</Link>)
										</th>
									</tr>
									<tr>
										<td className="text-right">Reimbursement upto:</td>
										<th>
											₹ {this.state.auditStore.reimbursement || this.state.auditStore.audit.reimbursement} (<Link to={`${this.props.location.pathname}/reimbursement`}>change</Link>)
										</th>
									</tr>
									<tr>
										<td className="text-right">Auditor:</td>
										<td>
											<AuditorNameDisplay user={this.state.auditStore.user}/>
											( <Envelope/> {auditorEmailLink})
										</td>
									</tr>
									<tr>
										<td className="text-right">Audit Date:</td>
										<th>{auditDateElement}</th>
									</tr>
									<tr>
										<td className="text-right">Status:</td>
										<th><AuditStoreStatusLabel status={this.state.auditStore.status}/></th>
									</tr>
									<tr>
										<td className="text-right">QA Rating:</td>
										<th>
											<AuditStoreRating rating={this.state.auditStore.qa_rating}/> (<Link to={`${this.props.location.pathname}/rate`}>change</Link>)
										</th>
									</tr>
								</tbody>
							</table>
							<div className="panel-footer text-right">
								{errorMessageElement}
								{submitButton}&nbsp;{unSubmitButton}&nbsp;{qaOkButton}
							</div>
						</div>
					</div>
					<div className="col-md-6">
						<div className="row" style={paddingStyle}>
							<div className="col-md-6">
								<label>Moderator Report Status : </label>
								{selectElement}
							</div>
							<div className="col-md-6">
							<label>Moderator Comment : </label>
								{textareaElement}
							</div>	
						</div>

						<div className="panel panel-default">
							<div className="panel-body">
								<MarkdownViewer markdown={this.state.auditStore.audit.post_approval_description || ""}/>
								<MarkdownViewer markdown={this.state.auditStore.audit.audit_cycle.post_approval_description || ""}/>
							</div>
						</div>
					</div>
				</div>
				<AttachmentBox auditStoreId={this.props.params.auditStoreId} auditStore={this.state.auditStore} editable={editable}/>
				<ReportSummary auditStoreId={parseInt(this.props.params.auditStoreId)} editable={editable} reportSummary={this.state.auditStore.report_summary}/>
				<AuditStoreSections auditStoreId={parseInt(this.props.params.auditStoreId)} auditStore={this.state.auditStore}/>
				{this.props.children}
			</div>
		);
	}
}
