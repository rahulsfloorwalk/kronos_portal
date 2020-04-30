import React from "react";
import PropTypes from "prop-types";
import { Link } from "react-router";

import moment from "moment";
import { momentDateFormat, momentDateTimeFormat }  from "../../../config.js";

import { findNotifications, findActors } from "../service/notification.js";

import { Bell } from "../../components/Icons.jsx";
import Loading from "../../components/Loading.jsx";

class NotificationItem extends React.Component {
	static propTypes = {
		n: PropTypes.shape({
			verb: PropTypes.string,
			actor: PropTypes.object,
			target: PropTypes.object,
			target_content_type: PropTypes.object,
			action_object: PropTypes.object,
			action_object_content_type: PropTypes.object,
			timestamp: PropTypes.string,
		}),
	};

	getVerb = (verb) => {
		switch(verb){
		case "AUDIT_APPLICATION_CANCELED":
			return <span className="text-default"> canceled </span>;
		case "AUDIT_APPLICATION_APPLIED":
			return <span className="text-warning"> applied </span>;
		case "AUDIT_APPLICATION_WAITLISTED":
			return <span className="text-warning"> waitlisted </span>;
		case "AUDIT_APPLICATION_APPROVED":
			return <span className="text-success"> approved </span>;
		case "AUDIT_APPLICATION_REJECTED":
			return <span className="text-danger"> rejected </span>;
		case "AUDIT_STORE_WITHDRAWN":
			return <span className="text-default"> withdrew </span>;
		case "AUDIT_STORE_ASSIGNED":
			return <span className="text-warning"> assigned </span>;
		case "AUDIT_STORE_FIAT_ASSIGNED":
			return <span className="text-warning"> fiat assigned </span>;
		case "AUDIT_STORE_ACKNOWLEDGED":
			return <span className="text-warning"> acknowledged </span>;
		case "AUDIT_STORE_UNSUBMITTED":
			return <span className="text-warning"> unsubmitted </span>;
		case "AUDIT_STORE_SUBMITTED":
			return <span className="text-primary"> submitted </span>;
		case "AUDIT_STORE_COMPLETED":
			return <span className="text-success"> completed </span>;
		case "AUDIT_STORE_FAILED":
			return <span className="text-danger"> failed </span>;
		case "AUDIT_STORE_ACCEPTED":
			return <span className="text-success"> accepted </span>;
		case "AUDIT_STORE_REJECTED":
			return <span className="text-danger"> rejected </span>;
		case "AUDIT_STORE_PENDING":
			return <span className="text-danger"> payment pending </span>;
		case "AUDIT_STORE_PAID":
			return <span className="text-success"> paid </span>;
		case "PAYMENT_FAILED":
			return <span className="text-danger"> failed </span>;

		default:
			return verb;
		}
	};

	getActionObjectText = (actionObject, type) => {
		var txt = type.app_label + "." + type.model;
		switch(txt){
		case "auditor.auditapplication":
			return <span>application dated: <b>{moment(actionObject.audit_date).format(momentDateFormat)}</b> by <b>{actionObject.profileinfo.first_name} {actionObject.profileinfo.last_name}</b></span>;
		case "audit_store.auditstore":
			return <span>report dated: <b>{moment(actionObject.audit_date).format(momentDateFormat) }</b></span>;
		case "payment.payment":
			return <span>payment dated: <b>{moment(actionObject.paid_on).format(momentDateFormat)}</b></span>;
		default:
			return txt;
		}
	};

	getTargetText = (target, type) => {
		var txt = type.app_label + "." + type.model;
		switch(txt){
		case "audit.audit":
			return (<span>
				audit,<br/>
				client: <b>{target.audit_cycle.client.name}</b>,
				store: <b>{target.store.name}</b>,
				cycle: <b>{target.audit_cycle.name}</b>
			</span>);
		default:
			return txt;
		}
	};

	getUrl = (n) => {
		if(n.verb.startsWith("AUDIT_STORE_")){
			return `/audit_store/${n.action_object.id}/report`;
		}
		if(n.verb.startsWith("AUDIT_APPLICATION_")){
			return `/audit_cycle/${n.target.audit_cycle.id}/audit`;
		}
		if(n.verb.startsWith("PAYMENT_")){
			return `/audit_store/${n.target.id}/report`;
		}
	};

	render() {
		let userName;
		if (this.props.n.actor.profileinfo){
			userName = <b>{this.props.n.actor.profileinfo.first_name} {this.props.n.actor.profileinfo.last_name}</b>;
		}
		else if(!this.props.n.actor.profileinfo){
			userName = <b>{this.props.n.actor.email}</b>;
		}

		let linkUrl = this.getUrl(this.props.n);
		let verbText = this.getVerb(this.props.n.verb);
		let targetText = this.getTargetText(this.props.n.target, this.props.n.target_content_type);
		let actionObjectText = this.getActionObjectText(this.props.n.action_object, this.props.n.action_object_content_type);
		let nTime = moment(this.props.n.timestamp);
		return (
			<Link className="list-group-item" to={linkUrl}>
				<span className="text-muted pull-right" title={nTime.format(momentDateTimeFormat)}>{nTime.fromNow()}</span>
				{userName} {verbText} {actionObjectText} on {targetText}
			</Link>
		);
	}
}

export default class NotificationBox extends React.Component {
	state = {
		notifications: [],
		actors: [],
		loading: false,
		verb: "",
		selectedActor: "",
	};

	reloadNotifications = (verb, actor=null) => {
		findNotifications({verb, actor}).then((notifications)=> this.setState({
			notifications
		}));
	};

	loadMoreNotifications = (verb, actor=null) => {
		if(this.state.notifications !== []){
			let beforeTime = this.state.notifications[this.state.notifications.length-1].timestamp;
			findNotifications({verb, actor, before: beforeTime}).then((notifications)=> {
				let newNotifications = this.state.notifications;
				for(let n of notifications){
					newNotifications.push(n);
				}
				this.setState({
					notifications: newNotifications
				});
			});
		}
	};

	verbChanged = (e) => {
		this.setState({
			verb: e.target.value
		});
		this.reloadNotifications(e.target.value, this.state.selectedActor);
	};

	actorChanged = (e) => {
		this.setState({
			selectedActor: e.target.value
		});
		this.reloadNotifications(this.state.verb, e.target.value);
	};

	componentDidMount() {
		this.reloadNotifications();
		findActors().then((actors) => {
			this.setState({actors});
		});
	}

	render() {
		if(this.state.notifications.length === 0){
			return <Loading/>;
		}
		let rows = [];
		for(var n of this.state.notifications) {
			rows.push(<NotificationItem n={n} key={n.id}/>);
		}

		if(rows.length === 0){
			rows.push(
				<div className="list-group-item text-center text-muted" key="empty">
				no notifications here
				</div>
			);
		}

		return (
			<div className="panel panel-primary">
				<div className="panel-heading">
					<div className="pull-right">
						<select className="form-control" onChange={this.actorChanged} value={this.state.selectedActor} style={{"display":"inline-block", "width": "200px"}}>
							<option value="">Everybody</option>
							{this.state.actors.map((a) => <option value={a.id} key={a.id}>{a.email}</option>)}
						</select>
							&nbsp;
						<select className="form-control" onChange={this.verbChanged} value={this.state.verb} style={{"display":"inline-block", "width": "200px"}}>
							<option value="">All Activity</option>
							<option value="AUDIT_APPLICATION_APPLIED">Application Applied</option>
							<option value="AUDIT_APPLICATION_CANCELED">Application Canceled</option>
							<option value="AUDIT_APPLICATION_WAITLISTED">Application Wait Listed</option>
							<option value="AUDIT_APPLICATION_APPROVED">Application Approved</option>
							<option value="AUDIT_APPLICATION_REJECTED">Application Rejected</option>
							<option value="AUDIT_STORE_SUBMITTED">Report Submitted</option>
							<option value="AUDIT_STORE_UNSUBMITTED">Report Un Submitted</option>
							<option value="AUDIT_STORE_ASSIGNED">Report Assigned</option>
							<option value="AUDIT_STORE_FIAT_ASSIGNED">Report Fiat Assigned</option>
							<option value="AUDIT_STORE_ACKNOWLEDGED">Report Acknowledged</option>
							<option value="AUDIT_STORE_WITHDRAWN">Report Withdrawn</option>
							<option value="AUDIT_STORE_FAILED">Report Failed</option>
							<option value="AUDIT_STORE_COMPLETED">Report Completed</option>
							<option value="AUDIT_STORE_ACCEPTED">Report Accepted</option>
							<option value="AUDIT_STORE_REJECTED">Report Rejected</option>
							<option value="AUDIT_STORE_PENDING">Payment Pending</option>
							<option value="AUDIT_STORE_PAID">Paid</option>
							<option value="PAYMENT_FAILED">Payment Failed</option>
						</select>
					</div>
					<h4>
						<Bell/> Notifications
					</h4>
				</div>
				<div className="list-group">
					{rows}
				</div>
				<div className="panel-footer text-center">
					<button className="btn btn-default" onClick={() => this.loadMoreNotifications(this.state.verb, this.state.selectedActor)}>
							Load More
					</button>
				</div>
			</div>
		);
	}
}
