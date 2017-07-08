import React from 'react';
import * as ReactRedux from 'react-redux';
import { Link } from 'react-router';

// import { fetchProfileInfo } from '../../auditor/actions/profile_info.js';

var RatingCard = React.createClass({
	componentWillMount: function(){
		// this.props.dispatch(fetchProfileInfo());
	},
	render: function(){
		return (
      <div className="panel text-center">
          <img src="/static/img/dp.png" alt="profile pic" className="img-circle" width="100" height="100" />
          <h4> {this.props.firstName} {this.props.lastName} </h4>
          <h5> {this.props.city}&emsp;&emsp;&emsp;{this.props.phone}</h5>
      </div>
		);
	},
});

export default RatingCard;
