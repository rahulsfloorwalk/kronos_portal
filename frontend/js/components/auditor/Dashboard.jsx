import React from 'react';
import * as ReactRedux from 'react-redux';
import { Link } from 'react-router';

import { fetchProfileInfo } from '../../actions.js';

var Dashboard = React.createClass({
	componentWillMount: function(){
		this.props.dispatch(fetchProfileInfo());
	},
	render: function(){
		if( this.props.firstName && this.props.lastName){
			return (
				<h3>Welcome {this.props.firstName} {this.props.lastName}</h3>
			);
		}
		return (
			<h3>Welcome, please begin by saving your details <Link to="details/profile/edit">here</Link></h3>
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
