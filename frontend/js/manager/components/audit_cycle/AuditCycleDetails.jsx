import React from "react";
import PropTypes from "prop-types";
import * as ReactRedux from "react-redux";
import { Link } from "react-router";

import moment from "moment";
import { momentDateFormat }  from "../../../../config.js";

import { fetchAuditCycle } from "../../actions/audit.js";

import AuditTypeLabel from "../../../components/AuditTypeLabel.jsx";
import ExpandableDetails from "../../../components/ExpandableDetails.jsx";
import MarkdownViewer from "../../../components/MarkdownViewer.jsx";
import { Envelope, King, Knight, Retweet, Inbox, Tasks, Pencil, File } from "../../../components/Icons.jsx";
import NavLink from "../../../components/NavLink.jsx";
import Loading from "../../../components/Loading.jsx";

import { getAuditStatus } from "../../../utils.js";

export class AuditCycleDetails extends React.Component{
	static propTypes = {
		params: PropTypes.shape({
			auditCycleId: PropTypes.string,
		}).isRequired,

		auditCycle: PropTypes.object,

		children: PropTypes.node,

		dispatch: PropTypes.func.isRequired,
	};

	static childContextTypes = {
		auditCycleId: PropTypes.number
	};

	getChildContext() {
		return {
			auditCycleId: Number(this.props.params.auditCycleId)
		};
	}

	componentDidMount(){
		this.props.dispatch(fetchAuditCycle(this.props.params.auditCycleId));
	}

	render(){
		if(! this.props.auditCycle){
			return <Loading/>;
		}

		let editAuditCycleLink = `/audit_cycle/${this.props.auditCycle.id}/edit`;
		let detailsElement = <ExpandableDetails details={<MarkdownViewer markdown={this.props.auditCycle.description}/>}/>;

		return (
			<div>
				<ol className="breadcrumb">
					<li><Link to="/client">Clients</Link></li>
					<li><Link to={`/client/${this.props.auditCycle.client.id}/audit_cycle`}><King/> {this.props.auditCycle.client.name}</Link></li>
					<li className="active"><Retweet/> {this.props.auditCycle.name}</li>
				</ol>
				<h3 className="page-header">
					<Link to={editAuditCycleLink} className="btn btn-default pull-right">
						<Pencil/>
					</Link>
					<Retweet/> { this.props.auditCycle.client.name } - { this.props.auditCycle.name } <small>( { detailsElement }) (<Link to={`/audit_cycle/${this.props.params.auditCycleId}/post_approval_description`}>Post Approval Desc.</Link>) (<Link to={`/audit_cycle/${this.props.params.auditCycleId}/checkpoints`}>Checkpoints</Link>) (<Link to={`/audit_cycle/${this.props.params.auditCycleId}/proofs_tag`}>Proofs Tag</Link>)</small>
				</h3>
				<div className="row" style={{fontSize:"110%"}}>
					<div className="col-xs-6 col-md-2">
						<p>
							<span className="text-muted">Type</span><br/>
							<b><AuditTypeLabel auditType={this.props.auditCycle.type}/></b>
						</p>
					</div>
					{ this.props.auditCycle.questionnaire_type ?
						<div className="col-xs-6 col-md-2">
							<p>
								<span className="text-muted">Questionnaire Type</span><br/>
								<b>{this.props.auditCycle.questionnaire_type.name}</b>
							</p>
						</div>
						: null }

					<div className="col-xs-6 col-md-1">
						<p>
							<span className="text-muted">Status</span><br/>
							<b>{ getAuditStatus(this.props.auditCycle.status) }</b>
						</p>
					</div>

					{ this.props.auditCycle.earnings_per_audit ?
						<div className="col-xs-6 col-md-1">
							<p>
								<span className="text-muted">Fees</span><br/>
								<b>₹ { this.props.auditCycle.earnings_per_audit }</b>
							</p>
						</div>
						: null }

					{ this.props.auditCycle.reimbursement ?
						<div className="col-xs-6 col-md-2">
							<p>
								<span className="text-muted">Reimbursement</span><br/>
								<b>₹ { this.props.auditCycle.reimbursement }</b>
							</p>
						</div>
						: null }

					<div className="col-xs-6 col-md-2">
						<p>
							<span className="text-muted">Start Date</span><br/>
							<b>{ moment(this.props.auditCycle.start_date).format(momentDateFormat) }</b>
						</p>
					</div>

					<div className="col-xs-6 col-md-2">
						<p>
							<span className="text-muted">End Date</span><br/>
							<b>{ moment(this.props.auditCycle.end_date).format(momentDateFormat) }</b>
						</p>
					</div>
					<div className="col-xs-6 col-md-2">
						<p>
							<span className="text-muted">Planned Audits</span><br/>
							<b>{ this.props.auditCycle.audit_count }</b>
						</p>
					</div>
				</div>
				<br/>
				<ul className="nav nav-tabs">
					<NavLink to={`/audit_cycle/${this.props.params.auditCycleId}/questionnaire`}><Tasks/> Questionnaire</NavLink>
					<NavLink to={`/audit_cycle/${this.props.params.auditCycleId}/audit`}><Inbox/> Audits</NavLink>
					<NavLink to={`/audit_cycle/${this.props.params.auditCycleId}/audit_store`}><File/> Reports</NavLink>
					<NavLink to={`/audit_cycle/${this.props.params.auditCycleId}/moderator_summary`}><Knight/> Moderator Summary</NavLink>
					<NavLink to={`/audit_cycle/${this.props.params.auditCycleId}/payment`}><b>₹</b> Payments</NavLink>
					<NavLink to={`/audit_cycle/${this.props.params.auditCycleId}/opportunity_email`}><Envelope/> Email</NavLink>
					{/*
					<NavLink to={`/audit_cycle/${this.props.params.auditCycleId}/moderator`}><Knight/> Moderators</NavLink>
					*/}
				</ul>
				{this.props.children}
			</div>
		);
	}
}

var mapStoreToProps = function(store, ownProps){
	return {
		auditCycle: store.auditCycles[ownProps.params.auditCycleId],
	};
};

export default ReactRedux.connect(mapStoreToProps)(AuditCycleDetails);
