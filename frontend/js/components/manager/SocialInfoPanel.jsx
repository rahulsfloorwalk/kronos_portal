import React from 'react';
import * as ReactRedux from 'react-redux';
import { fetchFacebookInfoForAuditor } from '../../manager/actions/auditor.js'
import { Link } from 'react-router';

import Loading from '../Loading.jsx';

var SocialInfoPanel = React.createClass({
	componentDidMount: function() {
		this.props.dispatch(fetchFacebookInfoForAuditor(this.props.auditorId));
	},
	render: function(){
		if(! this.props.socialInfo){
			return <Loading/>;
		}
		let is_complete = this.props.socialInfo.facebook_id ? "panel-success" : "panel-default";
		return (
			<div className={`panel ${is_complete}`}>
			<div className="panel-heading">
			<h3 className="panel-title">Social Info</h3>
			</div>
			<div className="panel-body">
			Facebook: { this.props.socialInfo.facebook_id ?
					<a href={`https://wwww.facebook.com/${this.props.socialInfo.facebook_id}`} target="_blank">Profile Link</a>
				: <span className="text-muted">not connected</span> }
			</div>
			</div>
		);
	},
});

var mapStoreToProps = function(store, ownProps){
	return {
		socialInfo: store.socialInfos[ownProps.auditorId]
	};
};

export default ReactRedux.connect(mapStoreToProps)(SocialInfoPanel);
