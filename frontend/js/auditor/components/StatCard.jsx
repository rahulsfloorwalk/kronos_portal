import React from 'react';
import * as ReactRedux from 'react-redux';
import { Link } from 'react-router';

// import { fetchProfileInfo } from '../../auditor/actions/profile_info.js';

var StatCard = React.createClass({
	componentWillMount: function(){
		// this.props.dispatch(fetchProfileInfo());
	},
	render: function(){
		return (
	<div className="text-center">
          <h3 className="page-header">{this.props.title}</h3>
          <img src={this.props.image} style={{display:"inline-block", width:"70px",height:"70px", marginRight:"20px"}} />
          <h2 style={{display:"inline-block"}}>{this.props.count}</h2>
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

export default ReactRedux.connect(mapStoreToProps)(StatCard);
