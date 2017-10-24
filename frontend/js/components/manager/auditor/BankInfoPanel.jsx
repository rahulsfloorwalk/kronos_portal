import React from 'react';
import * as ReactRedux from 'react-redux';
import { fetchBankInfoForAuditor } from '../../../manager/service/auditor.js'
import { Link } from 'react-router';

import Loading from '../../Loading.jsx';

export default React.createClass({
	getInitialState: function(){
		return {};
	},
	componentDidMount: function() {
		fetchBankInfoForAuditor(this.props.auditorId).done((bankInfo)=>this.setState({bankInfo}));
	},
	render: function(){
		if(! this.state.bankInfo){
			return <Loading/>;
		}
		var is_complete = this.state.bankInfo.is_complete ? "panel-success" : "panel-default";
		return (
			<div className={`panel ${is_complete}`}>
				<div className="panel-heading">
					<h3 className="panel-title">Bank Info</h3>
				</div>
				<div className="panel-body">
					<p>Bank Name: { this.state.bankInfo.bank_name }</p>
					<p>Account Holder Name: { this.state.bankInfo.account_holder_name }</p>
					<p>Account Number: { this.state.bankInfo.account_number }</p>
					<p>IFSC Code: { this.state.bankInfo.ifsc_code }</p>
					<p>Pan Number: { this.state.bankInfo.pan_number }</p>
				</div>
			</div>
		);
	},
});
