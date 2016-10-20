import React from 'react';
import * as ReactRedux from 'react-redux';
import { fetchBankInfo } from '../auditor_actions.js'
import { Link } from 'react-router';

var BankInfoPanelBase = React.createClass({
	componentDidMount: function() {
		this.props.dispatch(fetchBankInfo());
	},
	render: function(){
		return (
			<div className="panel panel-default">
				<div className="panel-heading">
					<h3 className="panel-title">Bank Info</h3>
				</div>
				<div className="panel-body">
					<Link to="details/bank/edit" className="btn btn-default pull-right">EDIT</Link>
					<p>Bank Name: { this.props.bankInfo.bank_name }</p>
					<p>Account Holder Name: { this.props.bankInfo.account_holder_name }</p>
					<p>Account Number: { this.props.bankInfo.account_number }</p>
					<p>IFSC Code: { this.props.bankInfo.ifsc_code }</p>
				</div>
			</div>
		);
	},
});

var mapStoreToProps = function(store){
	return {
		bankInfo: store.bankInfo
	};
};

export { BankInfoPanelBase };
export default ReactRedux.connect(mapStoreToProps)(BankInfoPanelBase);
