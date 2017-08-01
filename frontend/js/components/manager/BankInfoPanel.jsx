import React from 'react';
import * as ReactRedux from 'react-redux';
import { fetchBankInfoForAuditor } from '../../manager/actions/auditor.js'
import { Link } from 'react-router';

import Loading from '../Loading.jsx';

var BankInfoPanel = React.createClass({
	componentDidMount: function() {
		this.props.dispatch(fetchBankInfoForAuditor(this.props.auditorId));
	},
	render: function(){
		if(! this.props.bankInfo){
			return <Loading/>;
		}
		var is_complete = this.props.bankInfo.is_complete ? "panel-success" : "panel-default";
		return (
			<div className={`panel ${is_complete}`}>
				<div className="panel-heading">
					<h3 className="panel-title">Bank Info</h3>
				</div>
				<div className="panel-body">
					<p>Bank Name: { this.props.bankInfo.bank_name }</p>
					<p>Account Holder Name: { this.props.bankInfo.account_holder_name }</p>
					<p>Account Number: { this.props.bankInfo.account_number }</p>
					<p>IFSC Code: { this.props.bankInfo.ifsc_code }</p>
					<p>Pan Number: { this.props.bankInfo.pan_number }</p>
				</div>
			</div>
		);
	},
});

var mapStoreToProps = function(store, ownProps){
	return {
		bankInfo: store.bankInfos[ownProps.auditorId]
	};
};

export default ReactRedux.connect(mapStoreToProps)(BankInfoPanel);
