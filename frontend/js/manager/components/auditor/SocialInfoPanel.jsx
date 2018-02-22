import React from 'react';
import * as ReactRedux from 'react-redux';
import { fetchFacebookInfoForAuditor } from '../../service/auditor.js'
import { Link } from 'react-router';

import Loading from '../../../components/Loading.jsx';

export default React.createClass({
	getInitialState: function(){
		return {};
	},
	componentDidMount: function() {
		fetchFacebookInfoForAuditor(this.props.auditorId).done((socialInfo)=>this.setState({socialInfo}));
	},
	render: function(){
		if(! this.state.socialInfo){
			return <Loading/>;
		}
		let is_complete = this.state.socialInfo.facebook_id ? "panel-success" : "panel-default";
		return (
			<div className={`panel ${is_complete}`}>
			<div className="panel-heading">
			<h3 className="panel-title">Social Info</h3>
			</div>
			<div className="panel-body">
			Facebook: { this.state.socialInfo.facebook_id ?
					<a href={`https://wwww.facebook.com/${this.state.socialInfo.facebook_id}`} target="_blank">Profile Link</a>
				: <span className="text-muted">not connected</span> }
			</div>
			</div>
		);
	},
});
