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
      <div className="col-md-6">
  			<div className="panel text-center">
          <h4>{this.props.title}</h4>
          <img src={this.props.image} className="pull-left" width="70" height="70" />
          <h2 className="pull-left">&emsp;{this.props.count}</h2>
          <br/><br/><br/><br/>
  			</div>
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
