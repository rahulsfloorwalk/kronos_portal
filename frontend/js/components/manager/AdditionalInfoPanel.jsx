import React from 'react';
import * as ReactRedux from 'react-redux';
import { Link } from 'react-router';

import { fetchAdditionalInfoForAuditor } from '../../actions.js'
import { Check, Cross } from '../Icons.jsx';
import Loading from '../Loading.jsx';

var AdditionalInfoPanel = React.createClass({
	componentDidMount: function() {
		this.props.dispatch(fetchAdditionalInfoForAuditor(this.props.auditorId));
	},
	render: function(){
		if(! this.props.additionalInfo){
			return <Loading/>;
		}
		var has_car = this.props.additionalInfo.has_car ? <Check/> : <Cross/>;
		var weekend_audit = this.props.additionalInfo.weekend_audit ? <Check/> : <Cross/>;
		return (
			<div className="panel panel-default">
				<div className="panel-heading">
					<h3 className="panel-title">Additional Info</h3>
				</div>
				<div className="panel-body">
					<p>Has Car: { has_car }</p>
					<p>Weekend Audit: { weekend_audit }</p>
				</div>
			</div>
		);
	},
});

var mapStoreToProps = function(store, ownProps){
	return {
		additionalInfo: store.additionalInfos[ownProps.auditorId]
	};
};

export default ReactRedux.connect(mapStoreToProps)(AdditionalInfoPanel);
