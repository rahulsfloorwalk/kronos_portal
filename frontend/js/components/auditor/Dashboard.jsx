import React from 'react';
import * as ReactRedux from 'react-redux';
import { Link } from 'react-router';

import NotificationBox from './NotificationBox.jsx';

import { fetchProfileInfo } from '../../auditor/actions/profile_info.js';

var Dashboard = React.createClass({
	componentWillMount: function(){
		this.props.dispatch(fetchProfileInfo());
	},
	render: function(){
		if( this.props.firstName && this.props.lastName){
			return (
			<div>
				<h3 className="page-header">Welcome {this.props.firstName} {this.props.lastName}</h3>
				<div className="row">
					<div className="col-md-8">
						<NotificationBox/>
					</div>
				</div>
			</div>
			);
		}
		return (
			<div className="jumbotron text-center">
				<h2>Welcome to FloorWalk!</h2>
				<h3>Please <Link className="btn btn-success" to="details/profile/edit"> Click Here</Link> to begin by saving your details</h3>
				<p>We need to know more about you before we can assign audits to you.</p>
			</div>
		);
	},
});

var mapStoreToProps = function(store){
	return {
		firstName: store.profileInfo.first_name,
		lastName: store.profileInfo.last_name,
	};
};

export default ReactRedux.connect(mapStoreToProps)(Dashboard);
