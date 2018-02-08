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
					<colgroup>
						<col style={{width:"40%"}}/>
					</colgroup>
					<tbody>
					<tr><td className="text-right text-muted" style={{"width":"40%"}}>Bank Name:</td><th>{ this.props.bankInfo.bank_name_from_ifsc }</th></tr>
					<tr><td className="text-right text-muted">*Account Holder Name:</td><th>{ this.props.bankInfo.account_holder_name }</th></tr>
					<tr><td className="text-right text-muted">*Account Number:</td><th>{ this.props.bankInfo.account_number }</th></tr>
					<tr className={this.props.bankInfo.ifsc_code && !this.props.bankInfo.is_ifsc_code_valid ? "danger" : "" }>
						<td className="text-right text-muted">*IFSC Code:</td>
						<th>{ this.props.bankInfo.ifsc_code }</th>
					</tr>
					<tr className={this.props.bankInfo.pan_number && !this.props.bankInfo.is_pan_card_valid ? "danger" : "" }>
						<td className="text-right text-muted">*Pan Number:</td>
						<th>{ this.props.bankInfo.pan_number }</th>
					</tr>
					</tbody>
				</table>
				{ !this.props.bankInfo.is_valid ?
					<div className="panel-footer">
						<b className="">Payments will not be processed until valid bank details are provided.</b>
					</div>
					: null
				}
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
