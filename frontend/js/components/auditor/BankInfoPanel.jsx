import React from 'react';
import * as ReactRedux from 'react-redux';
import { Link } from 'react-router';

import { Pencil } from '../Icons.jsx';

import { fetchBankInfo } from '../../auditor/actions/bank_info.js'
import LabelValue from '../LabelValue.jsx'

var BankInfoPanelBase = React.createClass({
	componentDidMount: function() {
		this.props.dispatch(fetchBankInfo());
	},
	render: function(){
		return (
			<div className="panel panel-default">
				<div className="panel-heading">
					<Link to="details/bank/edit" className="btn btn-default pull-right"><Pencil/> Edit</Link>
					<h4 className="">Bank Info</h4>
				</div>
				<table className="table table-striped">
					<tr><td className="text-right text-muted" style={{"width":"40%"}}>Bank Name:</td><th>{ this.props.bankInfo.bank_name }</th></tr>
					<tr><td className="text-right text-muted">Account Holder Name:</td><th>{ this.props.bankInfo.account_holder_name }</th></tr>
					<tr><td className="text-right text-muted">Account Number:</td><th>{ this.props.bankInfo.account_number }</th></tr>
					<tr><td className="text-right text-muted">IFSC Code:</td><th>{ this.props.bankInfo.ifsc_code }</th></tr>
					<tr><td className="text-right text-muted">Pan Number:</td><th>{ this.props.bankInfo.pan_number }</th></tr>
				</table>
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
