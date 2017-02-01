import React from 'react';
import * as ReactRedux from 'react-redux';
import { Link } from 'react-router';

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
					<h3 className="panel-title">Bank Info</h3>
				</div>
				<div className="panel-body form-horizontal">
					<LabelValue label="Bank Name:" value={ this.props.bankInfo.bank_name }/>
					<LabelValue label="Account Holder Name:" value={ this.props.bankInfo.account_holder_name }/>
					<LabelValue label="Account Number:" value={ this.props.bankInfo.account_number }/>
					<LabelValue label="IFSC Code:" value={ this.props.bankInfo.ifsc_code }/>
					<LabelValue label="Pan Number:" value={ this.props.bankInfo.pan_number }/>
				</div>
				<div className="panel-footer text-right">
					<Link to="details/bank/edit" className="btn btn-default">EDIT</Link>
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
