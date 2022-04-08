import React from "react";
import { connect } from "react-redux";
import PropTypes from "prop-types";
import { hashHistory } from "react-router";
import Alert from "react-s-alert";
import FormInput from "../../../components/FormInput.jsx";

import Modal from "../../../components/Modal.jsx";
import SaveButton from "../../../components/SaveButton.jsx";

import { fetchClientBankInfo, updateClientBankInfo } from "../../service/client.js";

import Loading from "../../../components/Loading.jsx";

import { getInputEventChangeValue } from "../../../react_utils.js";

export class BankInfoForm extends React.Component {

	static propTypes = {
		clientId: PropTypes.number.isRequired,
	};

	state = {
		bank_info: "",
		form: {},
		errors: {}
	};

	componentDidMount() {
		if(this.props.clientId){
			fetchClientBankInfo(this.props.clientId).then((bank_info)=>{
				this.setState({
					bank_info,
					form: {
						id: bank_info.id,
						pan_number: bank_info.pan_number,
						gstin: bank_info.gstin
					}
				});
			});
		}
	}

	componentWillReceiveProps(ownProps){
		fetchClientBankInfo(ownProps.clientId).then((bank_info)=>{
			this.setState({
				bank_info,
				form: {
					id: bank_info.id,
					pan_number: bank_info.pan_number,
					gstin: bank_info.gstin
				}
			});
		});
	}

	inputChanged = (e) => {
		this.setState({
			form: Object.assign({}, this.state.form, getInputEventChangeValue(e)),
		});
	};

	onSubmit = (e) => {
		e.preventDefault();
		updateClientBankInfo(this.props.clientId, {
			id: this.state.form.id,
			pan_number: this.state.form.pan_number,
			gstin: this.state.form.gstin,
		}).done(function(){
			hashHistory.push("/profile");
			Alert.success("BANK INFO SAVED");
		}).fail((err)=>{
			this.setState({
				errors: err.responseJSON || {},
			});
		});
	};

	render() {
		if(! this.state.bank_info){
			return <Loading/>;
		}
		return (
			<Modal modalTitle="Edit Bank Info" onClose={hashHistory.goBack}>
				<form onSubmit={this.onSubmit}>
					<FormInput label="PAN Number" name="pan_number" value={this.state.form.pan_number} onChange={this.inputChanged} />
					<FormInput label="GSTIN" name="gstin" value={this.state.form.gstin} onChange={this.inputChanged} />
					<SaveButton/>
				</form>
			</Modal>
		);
	}
}

const mapStateToProps = (store) => {
	return {
		clientId: store.client.id
	};
};
export default connect(mapStateToProps)(BankInfoForm);