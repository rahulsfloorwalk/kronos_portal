import React from "react";
import PropTypes from "prop-types";

import FormErrorList from "../FormErrorList.jsx";
import FormInput from "../FormInput.jsx";
import Modal from "../Modal.jsx";
import Loading from "../Loading.jsx";

export default class EarningsPerAuditForm extends React.Component{
	static propTypes = {
		earningsPerAudit: PropTypes.number,

		onSubmit: PropTypes.func.isRequired,
		onClose: PropTypes.func.isRequired,

		errors: PropTypes.object,
		loading: PropTypes.bool,
	};

	state = {
		earnings_per_audit: 0,
	};

	componentDidMount(){
		this.setState({
			"earnings_per_audit": this.props.earningsPerAudit,
		});
	}
	componentWillReceiveProps(nextProps) {
		this.setState({
			"earnings_per_audit": nextProps.earningsPerAudit,
		});
	}
	fieldChanged = (e) => {
		this.setState({
			earnings_per_audit: parseInt(e.target.value),
		});
	};
	onSubmit = (e) => {
		e.preventDefault();
		this.props.onSubmit(this.state.earnings_per_audit);
	};
	render(){
		const modalTitle = "Set Audit Fees";
		if(this.props.loading){
			return (
				<Modal modalTitle={modalTitle} onClose={this.props.onClose}>
					<Loading/>
				</Modal>
			);
		}
		return (<Modal modalTitle={modalTitle} onClose={this.props.onClose}>
			<form onSubmit={this.onSubmit}>
				<FormErrorList errors={this.props.errors.non_field_errors}/>
				<FormInput type="number" label="Audit Fees" value={this.state.earnings_per_audit} name="earnings_per_audit" onChange={this.fieldChanged} errors={this.props.errors.earnings_per_audit}/>
				<button type="submit" className="btn btn-primary">Save Amount</button>
			</form>
		</Modal>);
	}
}

