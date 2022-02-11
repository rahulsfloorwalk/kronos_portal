import React, { Component } from "react";
import PropTypes from "prop-types";

import Alert from "react-s-alert";

import moment from "moment";
import { momentDateFormat }  from "../../../../config.js";

import { Link, withRouter } from "react-router";

import { Time, ThumbsUp, ThumbsDown, User, Earphone, Calendar } from "../../../components/Icons.jsx";

import { findByAudit, waitListApplication, setAuditApplicationComment } from "../../service/application.js";

import ApplicationStatusLabel from "../../../components/ApplicationStatusLabel.jsx";
import AuditStoreRating from "../../../components/AuditStoreRating.jsx";
import AuditorRating from "../../../components/AuditorRating.jsx";
import ApplicationRepeat from "../../../components/ApplicationRepeat.jsx";
import Loading from "../../../components/Loading.jsx";
import { auditApplicationPropType } from "../../prop_types.js";

export class AuditApplicationRow extends Component{
	static propTypes = {
		application: auditApplicationPropType,
		pathname: PropTypes.string
	};

	constructor(props){
		super(props);
		this.state = {
			comment: this.props.application.comment
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
	};

	render(){
		let { application } = this.props;
		let auditorUrl = `/auditor/${application.profileinfo.user_id}`;
		let auditorLink = (<Link to={auditorUrl}>{application.profileinfo.first_name} { application.profileinfo.last_name}</Link>);
		let approveLink, rejectLink, waitListButton, statusLabel;
		if( application.status === "APPLIED" || application.status === "WAITLISTED"){
			approveLink = (<Link to={`${this.props.pathname}/${application.audit}/application/${application.id}/approve`} className="btn btn-primary"><ThumbsUp/> Approve</Link>);
			rejectLink = (<Link to={`${this.props.pathname}/${application.audit}/application/${application.id}/reject`} className="btn btn-default"><ThumbsDown/> Deny</Link>);
			if( application.status !== "WAITLISTED"){
				waitListButton = (<button className="btn btn-default" onClick={() => this.waitListButtonClicked(application.id)}><Time/> Wait List</button>);
			} else if(application.status === "WAITLISTED") {
				waitListButton = <ApplicationStatusLabel status={application.status}/>;
			}
		} else {
			statusLabel = <ApplicationStatusLabel status={application.status}/>;
		}
		return(
			<tr key={application.id} className="">
				<td><User/>&nbsp;{auditorLink}<br/>&nbsp;&nbsp;&nbsp;&nbsp;(<AuditorRating rating={application.profileinfo.auditor_rating}/>)</td>
				<td><Earphone/>&nbsp;<a href={`tel:${application.profileinfo.mobile_number}`}>{application.profileinfo.mobile_number}</a></td>
				<td><Calendar/>&nbsp;{moment(application.audit_date).format(momentDateFormat)}</td>
				<td>{application.profileinfo.pincode}</td>
				<td>{application.distance !== null? (application.distance).toString() + " km" : "--" }</td>
				<td>{application.avg_qa_rating !== null? <AuditStoreRating rating={Math.round(application.avg_qa_rating)}/> : null}</td>
				<td>{application.report_exists ?<ApplicationRepeat report_exists={application.report_exists} report_data={application.report_exists_data}/>: null}</td>
				<td>
					{approveLink}&nbsp;{waitListButton}&nbsp;{rejectLink}
					{statusLabel}
				</td>
				<td>
					<textarea className="form-control" placeholder="Enter a comment" value={this.state.comment ? this.state.comment : ""} onChange={this.commentChanged} onBlur={this.onBlur} />
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
			rows = <tr><td className="text-center text-muted">no applications for this audit</td></tr>;
		}
		return (
			<table className="table">
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
