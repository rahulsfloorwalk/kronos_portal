import React from 'react';
import * as ReactRedux from 'react-redux';
import { Link } from 'react-router';

import moment from 'moment';
import { momentDateFormat, momentDateTimeFormat }  from '../../../config.js';

import { findNotifications } from '../../auditor/service/notification.js';

import { Bell, Refresh } from '../Icons.jsx';
import Panel from '../Panel.jsx';

var NotificationItem = React.createClass({
	getVerb: function(verb){
		switch(verb){
			case "AUDIT_APPLICATION_CANCELED":
				return <span className="text-default"> canceled </span>;
			case "AUDIT_APPLICATION_APPLIED":
				return <span className="text-warning"> applied </span>;
			case "AUDIT_APPLICATION_APPROVED":
				return <span className="text-success"> approved </span>;
			case "AUDIT_APPLICATION_REJECTED":
				return <span className="text-danger"> rejected </span>;
			case "AUDIT_STORE_WITHDRAWN":
				return <span className="text-default"> withdrawn </span>;
			case "AUDIT_STORE_ASSIGNED":
			case "AUDIT_STORE_FIAT_ASSIGNED":
				return <span className="text-warning"> assigned </span>;
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
				return <span className="text-danger"> pending </span>;
			case "AUDIT_STORE_PAID":
				return <span className="text-success"> paid </span>;
			default:
				return verb;
		}
	},
	getActionObjectText: function(actionObject, type){
		var txt = type.app_label + "." + type.model;
		switch(txt){
			case "auditor.auditapplication":
				return <span>application for date <b>{moment(actionObject.audit_date).format(momentDateFormat)}</b> by <b>{actionObject.profileinfo.first_name} {actionObject.profileinfo.last_name}</b></span>;
			case "audit_store.auditstore":
				return <span>report for date <b>{moment(actionObject.audit_date).format(momentDateFormat) }</b></span>;
			default:
				return txt;
		}
	},
	getTargetText: function(target, type){
		var txt = type.app_label + "." + type.model;
		switch(txt){
			case "audit.audit":
				return <span>
					audit,<br/>
					client: <b>{target.audit_cycle.client.name}</b>,
					store: <b>{target.store.location.name}</b>,
					cycle: <b>{target.audit_cycle.name}</b>
					</span>
			default:
				return txt;
		}
	},
	getUrl: function(n){
		if(n.verb.startsWith("AUDIT_STORE_")){
			return `/audit_store/${n.action_object.id}/section`
		}
		if(n.verb.startsWith("AUDIT_APPLICATION_")){
			return `/audit`;
		}
	},
	getClient: function(n){
		if(n.verb.startsWith("AUDIT_STORE_")){
			return n.action_object.audit.audit_cycle.client.name;
		}
		if(n.verb.startsWith("AUDIT_APPLICATION_")){
			return n.target.audit_cycle.client.name;
		}
	},
	render: function(){
		let userName = "Your";
		let linkUrl = this.getUrl(this.props.n);
		let verbText = this.getVerb(this.props.n.verb);
		let targetText = this.getTargetText(this.props.n.target, this.props.n.target_content_type);
		let actionObjectText = this.getActionObjectText(this.props.n.action_object, this.props.n.action_object_content_type);
		let nTime = moment(this.props.n.timestamp);
		let clientName = this.getClient(this.props.n);
		return (
			<Link className="list-group-item" to={linkUrl}>
				<span className="text-muted pull-right" title={nTime.format(momentDateTimeFormat)}>{nTime.fromNow()}</span>
				{userName} <b>{clientName}</b> {actionObjectText} is now <b>{verbText}</b>
			</Link>
		);
	}
});

export default React.createClass({
	getInitialState: function(){
		return {
			notifications: [],
			loading: false,
		};
	},
	reloadNotifications: function(){
		findNotifications({}).then((notifications)=> this.setState({
			notifications
		}));
	},
	loadMoreNotifications: function(){
		if(this.state.notifications !== []){
			let beforeTime = this.state.notifications[this.state.notifications.length-1].timestamp;
			findNotifications({before: beforeTime}).then((notifications)=> {
				let newNotifications = this.state.notifications;
				for(let n of notifications){
					newNotifications.push(n);
				}
				this.setState({
					notifications: newNotifications
				});
			});
		}
	},
	componentDidMount: function() {
		this.reloadNotifications();
	},
	render: function(){
		var rows = [];
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
					<h4 className="panel-title">
						<Bell/> Notifications
					</h4>
				</div>
				<div className="list-group">
					{rows}
				</div>
			</div>
		);
	},
});
