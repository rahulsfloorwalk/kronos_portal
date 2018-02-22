import React from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import { Link } from "react-router";

import { pointerStyle } from "../../styles.js";

import { Pencil, Check, Warning } from "../Icons.jsx";

import { fetchBankInfo } from "../../auditor/actions/bank_info.js";

class BankInfoPanelBase extends React.Component{
	static propTypes = {
		dispatch: PropTypes.func.isRequired,
		bankInfo: PropTypes.object.isRequired,
	};

	constructor(props) {
		super(props);
		this.state = {
			hover: false,
			expanded: false,
		};
	}

	toggleExpand = () => {
		this.setState({expanded: !this.state.expanded});
	};

	setHover = (hover) => this.setState(prevState => Object.assign({}, prevState, { hover }));

	componentDidMount(){
		this.props.dispatch(fetchBankInfo());
	}

	render(){
		let panelClass = this.props.bankInfo.is_complete ? "panel-success-hoverable" : "panel-default";
		let panelIcon = this.props.bankInfo.is_complete ? <Check/> : <Warning/>;

		if(this.props.bankInfo.is_complete){
			// is valid?
			panelClass = this.props.bankInfo.is_valid ? panelClass : "panel-danger";
			panelIcon = this.props.bankInfo.is_valid ? panelIcon : <Warning/>;
		}

		return (
			<div className={"panel " + panelClass}>
				<div className="panel-heading" onMouseEnter={() => this.setHover(true)} onMouseLeave={() => this.setHover(false)} style={pointerStyle} onClick={this.toggleExpand}>
				{this.state.expanded || !this.props.bankInfo.is_complete || !this.props.bankInfo.is_valid ? <Link to="details/bank/edit" className="btn btn-default pull-right"><Pencil/> Edit</Link> : null }
					<h4>{panelIcon} Payment Details</h4>
				</div>
				{ this.state.expanded || !this.props.bankInfo.is_complete || !this.props.bankInfo.is_valid ?
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
				: null }
				{ this.props.bankInfo.is_complete && !this.props.bankInfo.is_valid ?
					<div className="panel-footer">
						<b className="">Payments will not be processed until valid details are provided.</b>
					</div>
				: null }
				{ this.props.bankInfo.is_complete ? null :
				<div className="panel-footer">
					<p className="text-danger"><b>Please complete your payment information.</b></p>
				</div>
				}
			</div>
		);
	}
}

var mapStoreToProps = function(store){
	return {
		bankInfo: store.bankInfo
	};
};

export { BankInfoPanelBase };
export default connect(mapStoreToProps)(BankInfoPanelBase);
