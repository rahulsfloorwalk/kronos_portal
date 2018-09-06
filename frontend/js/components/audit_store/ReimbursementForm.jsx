import React from "react";
import PropTypes from "prop-types";

import FormErrorList from "../FormErrorList.jsx";
import FormInput from "../FormInput.jsx";
import Modal from "../Modal.jsx";
import Loading from "../Loading.jsx";

export default class ReimbursementForm extends React.Component{
	static propTypes = {
		reimbursement: PropTypes.number,

		onSubmit: PropTypes.func.isRequired,
		onClose: PropTypes.func.isRequired,

		errors: PropTypes.object,
		loading: PropTypes.bool,
	};

	state = {
		reimbursement: 0,
	};

	componentDidMount(){
		this.setState({
			"reimbursement": this.props.reimbursement,
		});
	}
	componentWillReceiveProps(nextProps) {
		this.setState({
			"reimbursement": nextProps.reimbursement,
		});
	}
	fieldChanged = (e) => {
		this.setState({
			reimbursement: parseInt(e.target.value),
		});
	};
	onSubmit = (e) => {
		e.preventDefault();
		this.props.onSubmit(this.state.reimbursement);
	};
	render(){
		const modalTitle = "Set Reimbursement";
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
				<FormInput type="number" label="Reimbursement" value={this.state.reimbursement} name="reimbursement" onChange={this.fieldChanged} errors={this.props.errors.reimbursement}/>
				<button type="submit" className="btn btn-primary">Save Amount</button>
			</form>
		</Modal>);
	}
}

