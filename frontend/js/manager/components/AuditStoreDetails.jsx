import React from "react";
import PropTypes from "prop-types";
import * as ReactRedux from "react-redux";
import { Link } from "react-router";
import $ from "jquery";

import Alert from "react-s-alert";

import Datetime from "react-datetime";
import "react-datetime/css/react-datetime.css";

import moment from "moment";
import { momentDateFormat, url }  from "../../../config.js";

import { auditStorePropType }  from "../prop_types";

import { fetchAuditStore,
	completeAuditStore,
	qaOkAuditStore,
	withdrawAuditStore,
	submitAuditStore,
	//unSubmitAuditStore,
	updateAuditStore,
	uncompleteAuditStore,
	acceptAuditStore,
	rejectAuditStore,
	pmRevertAuditStore,
	revertAuditStore
} from "../actions/audit_store.js";
import { setAuditDate, setAuditModeratorStatus,findProofNotAvailable, setAuditModeratorComment, saveCheckList, arrangeAttachment, unSubmitAuditStore } from "../service/audit_store.js";

import { Calendar, Retweet, King, File, Download } from "../../components/Icons.jsx";
import DropDown, { DropDownDivider } from "../../components/DropDown.jsx";
import Loading from "../../components/Loading.jsx";
import AuditStoreStatusLabel from "../../components/AuditStoreStatusLabel.jsx";
import AuditStoreRating from "../../components/AuditStoreRating.jsx";
import StarRating from "../../components/StarRating.jsx";
import MarkdownViewer from "../../components/MarkdownViewer.jsx";

import { getAuditType } from "../../utils.js";

import AttachmentDisplayBox from "./AttachmentDisplayBox.jsx";
import ReportSummary from "./ReportSummary.jsx";
import AuditorNameDisplay from "./AuditorNameDisplay.jsx";
import AuditStoreReportAttributesTable from "./audit_store/AuditStoreReportAttributesTable.jsx";
import ProofNotAvailable from "./ProofNotAvailable.jsx";
import { fetchConfig } from "../service/config.js";
import StatusLogsModal from "./StatusLogsModal.jsx";
import NpsOverallExperienceRating from "./NpsOverAllExperienceRating.jsx";
import ReferenceAttachmentBox from "./ReferenceAttachmentBox.jsx";

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
			auditDateLoading: false,
			display:"none",
			reason: "",
			errMsg: "",
			proof_not_available: [],
			isFailModalOpen:false,
			config: {},
			isStatusLogModalOpen: false,
		};
	}

	componentDidMount(){
		this.props.dispatch(fetchAuditStore(this.props.params.auditStoreId));
		findProofNotAvailable(this.props.params.auditStoreId).then(result=>{
			this.setState({proof_not_available:result});
		});
		fetchConfig().then((config) => {
			this.setState({config: config});
		});
	}

	showModal = () => {
		this.setState({ display:"block" });
	};

	hideModal = () => {
		this.setState({ display:"none", errMsg: "" });
	};
	showFailModal = () => {
		this.setState({ isFailModalOpen:true });
	};

	hideFailModal = () => {
		this.setState({ isFailModalOpen:false });
	};
	submit_hideModal = () => {
		if (this.state.reason === ""){
			this.setState({errMsg: "Please enter reason"});
		}
		else{
			this.unSubmitButtonClicked();
			this.setState({ display:"none" });
		}
	};

	showStatusLogModal = () => {
		this.setState({ isStatusLogModalOpen: true });
	};

	hideStatusLogModal = () => {
		this.setState({ isStatusLogModalOpen: false });
	};

	reasonChanged = (e) => {
		this.setState({
			reason: e.target.value,
			errMsg: ""
		});
	};

	onBlur = (e) => {
		this.reasonChanged(e);
	};

	withdrawButtonClicked = () => {
		this.props.dispatch(withdrawAuditStore(this.props.params.auditStoreId)).then(()=>{
			Alert.success("REPORT WITHDRAWN");
		});
	};
	revertButtonClicked = () => {
		this.props.dispatch(revertAuditStore(this.props.params.auditStoreId)).then(()=>{
			// Alert.success("REPORT REVERTED");
			location.reload();
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
		unSubmitAuditStore(this.props.params.auditStoreId, this.state.reason).then(()=>{
			// this.props.dispatch(updateAuditStore(auditStore));
			// this.setState({reason: ""});
			// Alert.success("REPORT Un SUBMITTED");
			location.reload();
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
	setModeratorStatus = (e) =>{
		setAuditModeratorStatus(this.props.auditStore.id,e.target.value).then((auditStore) => {
			this.props.dispatch(updateAuditStore(auditStore));
		});
	};
	setModeratorComment = (e) => {
		setAuditModeratorComment(this.props.auditStore.id,e.target.value);
	};
	openCheckPoint = () => {
		document.getElementsByClassName("main")[0].style.marginRight = "250px";
		document.getElementsByClassName("sidebar")[0].style.width = "250px";
		document.getElementsByClassName("checkpoint")[0].style.display = "none";
	};
	closeCheckPoint = () => {
		document.getElementsByClassName("main")[0].style.marginRight = "0";
		document.getElementsByClassName("sidebar")[0].style.width = "0";
		document.getElementsByClassName("checkpoint")[0].style.display = "block";
	};
	saveCheckPoints = () => {
		let check_points_list = [];
		$(".sidebar input:checked").each(function() {
			let val = $(this).attr("value");
			check_points_list.push(val);
		});
		saveCheckList(this.props.auditStore.id, check_points_list).then((auditStore) => {
			this.props.dispatch(updateAuditStore(auditStore));
			this.closeCheckPoint();
			Alert.success("CheckPoints Saved");
		});
	};
	arrangeAttachmentByProofTag = () => {
		arrangeAttachment(this.props.params.auditStoreId).then(() => {
			location.reload();
		});
	};
	formatTimewWithHourMinute = (timeString) => {
		if (!timeString || timeString === "00:00:00") {
			return "0 hours 0 minutes 0 seconds";
		}
		const [hours, minutes, seconds] = timeString.split(":").map(Number);
		return `${hours} hour${hours !== 1 ? "s" : ""} ${minutes} minute${minutes !== 1 ? "s" : ""} ${seconds} second${seconds !== 1 ? "s" : ""}`;
	};

	render(){
		const allowedUserIds = [4152,14287,305659,11413];
		const isForceSubmitEnabled = allowedUserIds.includes(this.state.config.USER_ID);
		if(! this.props.auditStore){
			return <Loading/>;
		}
		var paddingStyle={
			paddingBottom:"2%"
		};
		var faultyReportMessageStyle = {
			fontSize:"16px",
			color:"red",
			paddingRight:"5px"
		};

		const modalStyle = {
			display: this.state.display,
			overflow: "scroll"
		};
		const modalBackdropStyle = {
			zIndex: "1060",
			height: "100%"
		};
		const modalDialogStyle = {
			zIndex: "1070",
		};

		let faultyReportMessage = null;
		if(this.props.auditStore.find_faulty_report_count > 0){
			faultyReportMessage = (<span style={faultyReportMessageStyle}>{this.props.auditStore.find_faulty_report_count} Repeated Attachment Found</span>);
		}

		let auditDateElement = moment(this.props.auditStore.audit_date).format(momentDateFormat);

		let moreOptionsDropdown;
		let completeButton, unSubmitButton, submitButton, uncompleteButton, acceptButton, rejectButton, qaOkButton, pmRevertButton;
		if (this.props.auditStore.status === "ACKNOWLEDGED"){
			submitButton = (<button onClick={this.submitButtonClicked} type="button" className="btn btn-primary" disabled={!isForceSubmitEnabled}>
				Force Submit
			</button>);
		}
		if(this.props.auditStore.status === "SUBMITTED"){
			if(this.props.auditStore.user.agencyuser){
				unSubmitButton = (<button onClick={this.unSubmitButtonClicked} type="button" className="btn btn-default">
					Revert to Auditor
				</button>);
			}
			else{
				unSubmitButton = (<button onClick={this.showModal} type="button" className="btn btn-default">
					Revert to Auditor
				</button>);
			}
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
						<Link to={`/audit_store/${this.props.auditStore.id}/fail_report_message`}>Fail Report</Link>
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
		if(this.props.auditStore.status === "FAILED" ||
			this.props.auditStore.status === "WITHDRAWN"){
			moreOptionsDropdown = (<div className="btn-group">
				<button type="button" className="btn btn-default"
					onClick={(e)=>{e.stopPropagation(); this.moreOptionsDropdown && this.moreOptionsDropdown.toggle();}}>
					More Options
				</button>
				<DropDown ref={(d) => this.moreOptionsDropdown=d}>
					<li>
						<a onClick={this.revertButtonClicked}>
							Revoke Report
						</a>
					</li>
				</DropDown>
			</div>);
		}
		if(this.props.auditStore.status === "SUBMITTED" || this.props.auditStore.status === "PM_REVIEW" || this.props.auditStore.status === "ASSIGNED" || this.props.auditStore.status === "ACKNOWLEDGED"){
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

		var selectElement = null;
		var textareaElement = null;
		let refresh_report_button;
		if (this.props.auditStore.status === "SUBMITTED" || this.props.auditStore.status === "PM_REVIEW"){
			refresh_report_button = <button className="btn btn-primary pull-right" onClick={this.arrangeAttachmentByProofTag}>Refresh Report</button>;
			selectElement = (
				<select className="form-control" onChange={this.setModeratorStatus} value={this.props.auditStore.moderator_status}>
					<option value="">Select Status</option>
					<option value="MISS_IMAGE">Missing Image</option>
					<option value="MISS_AUDIO">Missing Audio</option>
					<option value="MISS_VIDEO">Missing Video</option>
					<option value="AUDITOR_NOT_RESPONDING">Auditor Not Responding</option>
					<option value="CONTRADICTION">Contradiction</option>
					<option value="NOT_SUFFICIENT_PROOFS">Not Sufficient Proofs</option>
					<option value="DATE_TIME_MISSING">Date or Time Missing in Image</option>
					<option value="WAITING_FOR_ATTACHMENT">Waiting for Attachment from Auditor</option>
					<option value="FAULTY_REPORT">Faulty Report</option>
				</select>);
			textareaElement = (
				<textarea className="form-control" onBlur={this.setModeratorComment} defaultValue={this.props.auditStore.moderator_comment}></textarea>
			);
		}
		else{
			selectElement = (
				<select className="form-control" onChange={this.setModeratorStatus} value={this.props.auditStore.moderator_status} disabled>
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
				<textarea className="form-control" onBlur={this.setModeratorComment} defaultValue={this.props.auditStore.moderator_comment} readOnly></textarea>
			);
		}

		var check_points = this.props.auditStore.check_points;
		var checkpointButton = null;
		var check_point_row = [];
		for (let i in check_points){
			if(check_points[i]["value"]){
				check_point_row.push(<li key={i}><label><input type="checkbox" value={i} defaultChecked /><span>{check_points[i]["checkpoint"]}</span></label></li>);
			}
			else{
				check_point_row.push(<li key={i}><label><input type="checkbox" value={i} /><span>{check_points[i]["checkpoint"]}</span></label></li>);
			}
		}
		if(check_point_row.length !=0){
			checkpointButton = (<button className="btn btn-danger checkpoint" onClick={this.openCheckPoint}>CheckPoints</button>);
		}
		let auditorRatingElement;
		if(this.props.auditStore.user.profileinfo){
			auditorRatingElement = (<tr>
				<td className="text-right">Auditor Rating:</td>
				<th style={{display:"flex"}}>
					<StarRating rating={this.props.auditStore.user.profileinfo.avg_auditor_rating} /> &nbsp;&nbsp;&nbsp;(<Link to={`/audit_store/${this.props.auditStore.id}/auditor_rating`}>change</Link>)
				</th>
			</tr>);
		}
		let auto_approved=this.props.auditStore.auto_assigned ? "(Auto Assigned)" : null;
		let instant_approved=this.props.auditStore.instant_assigned ? "(Instant Assigned)" : null;
		return (
			<div className="main">
				<ol className="breadcrumb">
					<li><Link to="/client">Clients</Link></li>
					<li><Link to={`/client/${this.props.auditStore.audit.audit_cycle.client.id}/audit_cycle`}><King/> {this.props.auditStore.audit.audit_cycle.client.name}</Link></li>
					<li><Link to={`/audit_cycle/${this.props.auditStore.audit.audit_cycle.id}/audit_store`}><Retweet/> {this.props.auditStore.audit.audit_cycle.name}</Link></li>
					<li className="active"><File/> {this.props.auditStore.audit.store.name}</li>
				</ol>
				{checkpointButton}
				<h2 className="page-header">
					<File/> Audit Report - {this.props.auditStore.id}
					{(this.props.auditStore.status && this.props.auditStore.status==="FAILED") ? (<span style={{marginLeft:"3rem",fontSize:"2rem"}}><span style={{color: "red"}}>Failed by:</span> {this.props.auditStore.failed_by && this.props.auditStore.failed_by.toLowerCase()} {this.props.auditStore.failed_by && this.props.auditStore.failed_by.toLowerCase()==="manual" ? (<span onClick={this.showFailModal} style={{textDecoration:"underline",textUnderlineOffset:"2px",color:"#007dc1",cursor:"pointer"}}>View</span>): null}</span>) : null}
					<div className="pull-right">
						{faultyReportMessage}
						<button type="button" className="btn btn-default" style={{marginRight:10, marginLeft:10}}
							onClick={this.showStatusLogModal}>
							Status Logs
						</button>
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
										<td className="text-right">Trainer:</td>
										<td>
											<div style={{display:"flex",justifyContent:"flex-start",alignItems:"center",gap:".3rem"}}><b>{this.props.auditStore.audit.client_trainer ? this.props.auditStore.audit.client_trainer.trainer.name : "---"}</b> | <a href={`tel:${this.props.auditStore.audit.client_trainer && this.props.auditStore.audit.client_trainer.trainer.mobile}`}>({this.props.auditStore.audit.client_trainer ? this.props.auditStore.audit.client_trainer.trainer.mobile : "---"})</a></div>
										</td>
									</tr>
									<tr>
										<td className="text-right">Certification Score:</td>
										<td><b>{this.props.auditStore.user.profileinfo.certification_score ? this.props.auditStore.user.profileinfo.certification_score : "NA" }</b></td>
									</tr>
									<tr>
										<td className="text-right">Audit Date:</td>
										<th>{auditDateElement}</th>
									</tr>
									<tr>
										<td className="text-right">Auditor Submission Date:</td>
										<th>moment(this.props.auditStore.submit_at).format(momentDateFormat)</th>
										{/* <th>{moment(this.props.auditStore.submit_at).format("DD MMM YYYY, hh:mm A")}</th> */}
									</tr>
									{this.props.auditStore.audit_store_percentage ?
										<tr>
											<td className="text-right">Overall Experience:</td>
											<th>
												{this.props.auditStore.audit_store_percentage}%
											</th>
										</tr>
										: null }
									<tr>
										<td className="text-right">Status:</td>
										<th>
											<tr><AuditStoreStatusLabel status={this.props.auditStore.status}/></tr>
											<tr>
												<td colSpan="10">
													<div style={{marginTop:"4px"}}>
														<i>{auto_approved}{instant_approved}</i>
													</div>
												</td>
											</tr>
										</th>
									</tr>
									<tr style={this.props.auditStore.report_revert_count>0 ? {color:"red"}: null}>
										<td className="text-right">Report Revert Count:</td>
										<th>{this.props.auditStore.report_revert_count}</th>
									</tr>
									<tr>
										<td className="text-right">Auditor Report Submit Time:</td>
										<th>{ this.formatTimewWithHourMinute(this.props.auditStore.report_submission_time)}</th>
									</tr>
									<tr>
										<td className="text-right">Moderator Report Submit Time:</td>
										<th>{ this.formatTimewWithHourMinute(this.props.auditStore.moderator_submission_time)}</th>
									</tr>
									<tr>
										<td className="text-right">Report Rating:</td>
										<th>
											<AuditStoreRating rating={this.props.auditStore.qa_rating}/>
											{/* <AuditStoreRating rating={this.props.auditStore.qa_rating}/> (<Link to={`/audit_store/${this.props.auditStore.id}/qa_rating`}>change</Link>) */}
										</th>
									</tr>
									{auditorRatingElement}
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
						{detailsElement}
					</div>
				</div>
				{refresh_report_button}
				<ReferenceAttachmentBox auditStoreId={this.props.params.auditStoreId}/>
				<AttachmentDisplayBox auditStoreId={this.props.params.auditStoreId}/>
				{this.state.proof_not_available.length>0 && <ProofNotAvailable proof_not_available={this.state.proof_not_available}/>}
				{/* <ReportSummary auditStoreId={parseInt(this.props.params.auditStoreId)} editable={this.isSummaryEditable()}/> */}
				{this.props.auditStore.audit.audit_cycle.audit_report_summary ?
					<ReportSummary auditStoreId={parseInt(this.props.params.auditStoreId)} editable={this.isSummaryEditable()}/>
					: null
				}
				{this.props.children}
				<NpsOverallExperienceRating
					editable={this.isSummaryEditable()}
					rating={this.props.auditStore.nps_section || 0}
					auditStoreId={parseInt(this.props.params.auditStoreId)}
				/>
				<div className="sidebar">
					<button className="btn btn-primary savebtn" onClick={this.saveCheckPoints}>Save</button>
					<a href="javascript:void(0)" className="closebtn" onClick={this.closeCheckPoint}>×</a>
					<ul>
						{check_point_row}
					</ul>
					<br/>
					<br/>
					<br/>
					<br/>
					<br/>
				</div>

				<div className="modal" tabIndex="-1" style={modalStyle}>
					<div className="modal-backdrop fade in" style={modalBackdropStyle} onClick={this.hideModal}/>
					<div className="modal-dialog" style={modalDialogStyle}>
						<div className="modal-content">
							<div className="modal-header">
								<button type="button" className="close" onClick={this.hideModal}>&times;</button>
								<h4 className="modal-title">Revert To Auditor</h4>
							</div>
							<div className="modal-body">
								Please Enter reason for reverting the audit to auditor
								<textarea rows="5" className="form-control" value={this.state.reason} onChange={this.reasonChanged} onBlur={this.onBlur} />
								<span style={{color:"red"}}>{this.state.errMsg}</span>
							</div>
							<div className="modal-footer">
								<button type="button" className="btn btn-primary" onClick={this.submit_hideModal}>Submit</button>
								<button type="button" className="btn btn-default" onClick={this.hideModal}>Close</button>
							</div>
						</div>
					</div>
				</div>
				{this.state.isFailModalOpen ?
					<div className="modal" tabIndex="-1" style={{ display: "block", overflow: "scroll" }}>
						<div className="modal-backdrop fade in" style={modalBackdropStyle} onClick={this.hideFailModal}/>
						<div className="modal-dialog" style={modalDialogStyle}>
							<div className="modal-content">
								<div className="modal-header">
									<button type="button" className="close" onClick={this.hideFailModal}>&times;</button>
									<h4 className="modal-title">Reason to Fail the Report</h4>
								</div>
								<div className="modal-body">
									<p>Failed By : {(this.props.auditStore.failed_status_log && this.props.auditStore.failed_status_log.user_actor ) ? this.props.auditStore.failed_status_log.user_actor : "" }</p>
									<p>Message : {(this.props.auditStore.failed_status_log && this.props.auditStore.failed_status_log.message) ? this.props.auditStore.failed_status_log.message : "No failure message available"}</p>
								</div>
								<div className="modal-footer">
									<button type="button" className="btn btn-default" onClick={this.hideFailModal}>Close</button>
								</div>
							</div>
						</div>
					</div>:null}
				{
					this.state.isStatusLogModalOpen && (
						<StatusLogsModal
							isOpen={this.state.isStatusLogModalOpen}
							auditStoreId={this.props.params.auditStoreId}
							onClose={this.hideStatusLogModal}
						/>
					)
				}
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
