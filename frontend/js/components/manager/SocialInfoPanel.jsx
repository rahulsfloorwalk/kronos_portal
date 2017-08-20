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
		var is_complete = this.props.socialInfo.facebook_id !== "" ? "panel-success" : "panel-default";
    var fb_profile = "http://wwww.facebook.com/" + this.props.socialInfo.facebook_id;
		return (
			<div className={`panel ${is_complete}`}>
				<div className="panel-heading">
					<h3 className="panel-title">Social Info</h3>
				</div>
				<div className="panel-body">
          <a href={fb_profile} target="_blank">Facebook Profile</a>
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
