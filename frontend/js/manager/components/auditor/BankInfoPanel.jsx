import React from "react";
import PropTypes from "prop-types";
import { fetchBankInfoForAuditor } from "../../service/auditor.js";

import Loading from "../../../components/Loading.jsx";

export default class BankInfoPanel extends React.Component {
	static propTypes = {
		auditorId: PropTypes.number.isRequired,
	};
	state = {};

	componentDidMount() {
		fetchBankInfoForAuditor(this.props.auditorId).done((bankInfo)=>this.setState({bankInfo}));
	}

	render() {
		if(! this.state.bankInfo){
			return <Loading/>;
		}
		var is_complete = this.state.bankInfo.is_complete ? "panel-success" : "panel-default";
		if(this.state.bankInfo.is_complete){
			is_complete = this.state.bankInfo.is_valid ? "panel-success" : "panel-danger";
		}
		return (
			<div className={`panel ${is_complete}`}>
				<div className="panel-heading">
					<h3 className="panel-title">Bank Info</h3>
				</div>
				<div className="panel-body">
					<p>Bank Name: { this.state.bankInfo.bank_name_from_ifsc }</p>
					<p>Account Holder Name: { this.state.bankInfo.account_holder_name }</p>
					<p>Account Number: { this.state.bankInfo.account_number }</p>
					<p>IFSC Code: { this.state.bankInfo.ifsc_code }</p>
					<p>Pan Number: { this.state.bankInfo.pan_number }</p>
				</div>
				{ !this.state.bankInfo.is_valid
					?
					<div className="panel-footer">
						<b className="text-danger">PAN Number or IFSC is incorrect.</b>
					</div>
					: null
				}
			</div>
		);
	}
}
