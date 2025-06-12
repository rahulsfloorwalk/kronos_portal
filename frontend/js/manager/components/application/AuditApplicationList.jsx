import React, { Component } from "react";
import PropTypes from "prop-types";

import Alert from "react-s-alert";

import moment from "moment";
import { momentDateFormat }  from "../../../../config.js";

import { Link, withRouter } from "react-router";

import { Time, ThumbsUp, ThumbsDown, Pencil,Star } from "../../../components/Icons.jsx";

import { findByAudit, waitListApplication, setAuditApplicationComment } from "../../service/application.js";
import { find_recent_audit_store_by_user_id } from "../../service/audit_store.js";

import ApplicationStatusLabel from "../../../components/ApplicationStatusLabel.jsx";
import AuditStoreRating from "../../../components/AuditStoreRating.jsx";
import StarRating from "../../../components/StarRating.jsx";
import ApplicationRepeat from "../../../components/ApplicationRepeat.jsx";
import Loading from "../../../components/Loading.jsx";
import { auditApplicationPropType } from "../../prop_types.js";

const modalStyle = {
	display: "block",
	overflow: "scroll"
};
const modalBackdropStyle = {
	zIndex: "1060",
	height: "100%"
};
const modalDialogStyle = {
	zIndex: "1070",
};
const modalBodyStyle = {
	maxHeight:"85vh",
	overflowY:"scroll"
};

export class AuditApplicationRow extends Component{
	static propTypes = {
		application: auditApplicationPropType,
		pathname: PropTypes.string
	};

	constructor(props){
		super(props);
		this.state = {
			comment: this.props.application.comment,
			recent_audit_reports: [],
			is_recent_audits_visible: false,
			comment_editable: false,
		};
	}

	commentChanged = (e) => {
		this.setState({
			comment: e.target.value,
		});
	};

	waitListButtonClicked(application_id){
		waitListApplication(application_id).then(() => {
			this.componentDidMount();
			Alert.success("APPLICATION WAIT LISTED");
		}, () => {
			Alert.warning("THERE WAS AN ERROR");
		});
	}

	onBlur = () => {
		if(this.state.comment != null && this.state.comment != ""){
			setAuditApplicationComment(this.props.application.id, this.state.comment).then(()=>{
				Alert.success("APPLICATION COMMENT SAVED");
			}, () => {
				Alert.warning("THERE WAS AN ERROR");
			});
		}
		this.setCommentEditable();
	};

	setCommentEditable = () => {
		this.setState((prevState) => ({
			comment_editable: !prevState.comment_editable,
		}));
	};

	showRecentAudits = () => {
		if(!this.state.is_recent_audits_visible && this.state.recent_audit_reports.length == 0){
			find_recent_audit_store_by_user_id(this.props.application.profileinfo.user_id).then((audit_reports) => this.setState((prevState) => ({
				recent_audit_reports: audit_reports,
				is_recent_audits_visible: !prevState.is_recent_audits_visible,
			})));
		}
		else{
			this.setState((prevState) => ({
				is_recent_audits_visible: !prevState.is_recent_audits_visible,
			}));
		}
	};

	render(){
		let { application } = this.props;
		let auditorUrl = `/auditor/${application.profileinfo.user_id}`;
		let auditorLink = (<Link to={auditorUrl}>{application.profileinfo.first_name} { application.profileinfo.last_name}</Link>);
		let approveLink, rejectLink, waitListButton, statusLabel;
		if( application.status === "APPLIED" || application.status === "WAITLISTED"){
			approveLink = (<Link to={`${this.props.pathname}/${application.audit}/application/${application.id}/approve`} className="btn btn-sm btn-primary"><ThumbsUp/> Approve</Link>);
			rejectLink = (<Link to={`${this.props.pathname}/${application.audit}/application/${application.id}/reject`} className="btn btn-sm btn-default"><ThumbsDown/> Deny</Link>);
			if( application.status !== "WAITLISTED"){
				waitListButton = (<button className="btn btn-sm btn-default" onClick={() => this.waitListButtonClicked(application.id)}><Time/> Wait List</button>);
			} else if(application.status === "WAITLISTED") {
				waitListButton = <ApplicationStatusLabel status={application.status}/>;
			}
		} else {
			statusLabel = <ApplicationStatusLabel status={application.status}/>;
		}
		let auto_approved=application.is_automation_approve ? "(Auto Assigned)" : null;
		let instant_approved=application.is_instant_approve ? "(Instant Assigned)" : null;
		let reports = [];
		for(let report of this.state.recent_audit_reports){
			reports.push(<tr key={report.id}>
				<td>{report.audit__audit_cycle__client__name}</td>
				<td>{report.audit__audit_cycle__name}</td>
				<td>{report.audit_date}</td>
				<td><AuditStoreRating rating={Math.round(report.qa_rating)}/></td>
				<td><Link to={`/audit_store/${report.id}/report`} ><button className="btn btn-primary"> View Report </button></Link></td>
			</tr>);
		}
		return(
			<tr key={application.id} className="">
				<td>{auditorLink}<br/><a href={`tel:${application.profileinfo.mobile_number}`}>{application.profileinfo.mobile_number}</a> {application.is_super_auditor? <Star/> : null } </td>
				<td>{moment(application.audit_date).format(momentDateFormat)}</td>
				<td><StarRating rating={application.profileinfo.avg_auditor_rating}/></td>
				<td>{application.profile_match_percentage}%</td>
				<td>{application.distance !== null? (application.distance).toString() + " km" : "--" }</td>
				<td>{application.report_exists ?<ApplicationRepeat report_exists={application.report_exists} report_data={application.report_exists_data}/>: "----"}</td>
				<td>{application.auditor_audit_count > 0 ? <button className="btn btn-sm btn-primary" onClick={this.showRecentAudits}>View {application.auditor_audit_count} reports</button> : 0}</td>
				<td>{application.profileinfo.certification_score ? application.profileinfo.certification_score : "--" }</td>
				<td>{application.audit_cycle_count_for_auditor ? application.audit_cycle_count_for_auditor : "--" }</td>
				<td>
					<tr >
						{approveLink}&nbsp;{waitListButton}&nbsp;{rejectLink}
						{statusLabel}&nbsp;
					</tr>
					<tr>
						<td colSpan="10">
							<div style={{ marginTop: "4px" }}>
								<i>{auto_approved}{instant_approved}</i>
							</div>
						</td>
					</tr>
				</td>
				<td>
					{this.state.comment_editable ? <textarea className="form-control" placeholder="Enter a comment" value={this.state.comment ? this.state.comment : ""} onChange={this.commentChanged} onBlur={this.onBlur} /> : this.state.comment}
					{this.state.comment_editable == false ? <a href="javascript:void(0);" onClick={this.setCommentEditable}>&nbsp;<Pencil/>&nbsp;</a> : null}

					{this.state.is_recent_audits_visible ? <div className="modal left" tabIndex="-1" style={modalStyle}>
						<div className="modal-backdrop fade in" style={modalBackdropStyle} onClick={this.showRecentAudits}/>
						<div className="modal-dialog" style={modalDialogStyle}>
							<div className="modal-content">
								<div className="modal-header">
									<button type="button" className="close" onClick={this.showRecentAudits}>&times;</button>
									<h4 className="modal-title">Audit Reports</h4>
								</div>
								<div className="modal-body" style={modalBodyStyle}>
									<div className="table-responsive">
										<table className="table">
											<thead>
												<tr>
													<th>Client</th>
													<th>Audit Cycle</th>
													<th>Audit Date</th>
													<th>Rating</th>
													<th>Action</th>
												</tr>
											</thead>
											<tbody>
												{reports}
											</tbody>
										</table>
									</div>
								</div>
							</div>
						</div>
					</div>
						: null}
				</td>
			</tr>
		);
	}
}

class AuditApplicationList extends Component{
	static propTypes = {
		auditId: PropTypes.number.isRequired,
		location: PropTypes.shape({
			state: PropTypes.shape({
				t: PropTypes.string,
			}),
		}),
		loading: PropTypes.bool,
	};
	constructor(props){
		super(props);
		this.state = {
			loading: false,
			applications: [],
		};
	}
	setLoading = (loading) => {
		this.setState(prevState => Object.assign({}, prevState, { loading }));
	};
	reloadApplications = (auditId) => {
		this.setLoading(true);
		findByAudit(auditId).then((applications) => {
			this.setState({applications});
		}).always(()=>this.setLoading(false));
	};
	componentDidMount(){
		this.reloadApplications(this.props.auditId);
	}
	componentWillReceiveProps(nextProps){
		let t = nextProps.location.state && nextProps.location.state.t;
		if(this.props.auditId !== nextProps.auditId || (t && this.state.lastReloadAt !== t)){
			this.setState({lastReloadAt: t});
			this.reloadApplications(nextProps.auditId);
		}
	}
	render(){
		if(this.props.loading){
			return <Loading/>;
		}
		let rows = [];
		for( let app of this.state.applications){
			rows.push(
				<AuditApplicationRow key={app.id} application={app} pathname={this.context.router.location.pathname} />
			);
		}
		if(rows.length === 0){
			rows = <tr><td className="text-center text-muted" colSpan={9}>no applications for this audit</td></tr>;
		}
		return (
			<table className="table">
				<thead>
					<tr>
						<th style={{width: "15%"}}>Auditor</th>
						<th style={{width: "10%"}}>Audit Date</th>
						<th style={{width: "8%"}}>Auditor Rating</th>
						<th style={{width: "5%"}}>Profile match</th>
						<th style={{width: "5%"}}>Distance</th>
						<th style={{width: "5%"}}>Previous Report</th>
						<th style={{width: "10%"}}>Total Auditor Audits</th>
						<th style={{width: "5%"}}>Certification Score</th>
						<th style={{width: "5%"}}>Auditor Reassign Count</th>
						<th style={{width: "25%"}}>Status</th>
						<th style={{width: "12%"}}>Comment</th>
					</tr>
				</thead>
				<tbody>
					{rows}
				</tbody>
			</table>
		);
	}
}

AuditApplicationList.contextTypes = {
	auditCycleId: PropTypes.number,
	router: PropTypes.object,
};

export default withRouter(AuditApplicationList);
