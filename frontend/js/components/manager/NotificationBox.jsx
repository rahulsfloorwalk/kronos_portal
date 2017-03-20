import React from 'react';
import * as ReactRedux from 'react-redux';
import { Link } from 'react-router';

import { findNotifications } from '../../manager/service/notification.js';

import { Bell, Refresh } from '../Icons.jsx';
import Panel from '../Panel.jsx';

var NotificationItem = React.createClass({
	getVerb: function(verb){
		switch(verb){
			case "APPLICATION_CANCELED":
				return " canceled ";
			case "APPLICATION_APPLIED":
				return " applied ";
			default:
				return verb;
		}
	},
	getActionObjectText: function(actionObject, type){
		switch(type.app_label){
			case "application":
				return "application";
			default:
				return type.app_label;
		}
	},
	getTargetText: function(target, type){
		switch(type.app_label){
			case "audit":
				return "audit";
			default:
				return type;
		}
	},
	render: function(){
		let userName;
		if (this.props.n.actor.profileinfo){
			userName = <b>{this.props.n.actor.profileinfo.first_name} {this.props.n.actor.profileinfo.last_name}</b>;
		}
		else if(!this.props.n.actor.profileinfo){
			userName = <b>Manager</b>;
		}

		let verbText = this.getVerb(this.props.n.verb);
		let targetText = this.getTargetText(this.props.n.target, this.props.n.target_content_type);
		let actionObjectText = this.getActionObjectText(this.props.n.action_object, this.props.n.action_object_content_type);
		return (
			<a className="list-group-item">
				{userName} {verbText} {actionObjectText} on {targetText}
			</a>
		);
	}
});

export default React.createClass({
	getInitialState: function(){
		return {
			notifications: []
		};
	},
	reloadNotifications: function(){
		findNotifications().then((notifications)=> this.setState({
			notifications
		}));
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
					<button className="btn btn-default btn-sm pull-right" onClick={this.reloadNotifications}>
						<Refresh/>
					</button>
					<h4>
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
