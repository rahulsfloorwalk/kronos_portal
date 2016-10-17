import React from 'react';
import * as ReactRedux from 'react-redux';
import { Link } from 'react-router';

import { fetchAdditionalInfo } from '../actions.js'
import { Check, Cross } from './Icons.jsx';

var AdditionalInfoPanel = React.createClass({
	componentWillMount: function() {
		this.props.dispatch(fetchAdditionalInfo());
	},
	render: function(){
		var has_car = this.props.additionalInfo.has_car ? <Check/> : <Cross/>;
		var weekend_audit = this.props.additionalInfo.weekend_audit ? <Check/> : <Cross/>;

		return (
			<div className="panel panel-default">
				<div className="panel-heading">
					<h3 className="panel-title">Additional Info</h3>
				</div>
				<div className="panel-body">
					<Link to="details/additional/edit" className="btn btn-default pull-right">EDIT</Link>
					<p>Has Car: { has_car }</p>
					<p>Weekend Audit: { weekend_audit }</p>
				</div>
			</div>
		);
	},
});

var mapStoreToProps = function(store){
	return {
		additionalInfo: store.additionalInfo
	};
};

export default ReactRedux.connect(mapStoreToProps)(AdditionalInfoPanel); 
