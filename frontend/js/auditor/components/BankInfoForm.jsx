import React from "react";
import { connect } from "react-redux";
import { hashHistory } from "react-router";
import PropTypes from "prop-types";

import { fetchBankInfo, saveBankInfo } from "../actions/bank_info.js";

import FormInput from "../../components/FormInput.jsx";
import SaveButton from "../../components/SaveButton.jsx";
import Modal from "../../components/Modal.jsx";
import Loading from "../../components/Loading.jsx";

class BankInfoForm extends React.Component {

	static propTypes = {
		dispatch: PropTypes.func,
		router: PropTypes.shape({
			push: PropTypes.func,
		}),
		bankInfo: PropTypes.object,
	};

	constructor(props){
		super(props);
		this.state = {
			form: {},
			errors: {},
			loading: true,
			saving: false,
		};
	}

	componentDidMount() {
		this.setLoading(true);
		this.props.dispatch(fetchBankInfo()).always(() => this.setLoading(false));
	}

	componentWillReceiveProps(nextProps) {
		this.setState({form: nextProps.bankInfo});
	}

	setLoading = (loading) => this.setState((prevState) => Object.assign({}, prevState, { loading }));
	setSaving = (saving) => this.setState((prevState) => Object.assign({}, prevState, { saving }));

	inputChanged = (e) => {
		this.setState({
			form: Object.assign({}, this.state.form, {
				[e.target.name] : e.target.value,
			})
		});
	};

	onSubmit = (e) => {
		e.preventDefault();
		this.setSaving(true);
		this.props.dispatch(saveBankInfo(this.state.form)).then(() => {
			this.props.router.push("/details");
		}, (errors) => {
			this.setState({
				errors: errors.responseJSON || {},
			});
			this.setSaving(false);
		});
	};

	render(){
		return (
			<Modal modalTitle="Edit Bank Info" onClose={hashHistory.goBack}>
				<div className="form-group"><big><i>fields marked <b>✳</b> must be filled to apply to audits</i></big></div>
				{ this.state.loading ?
					<Loading/>
					:
					<form onSubmit={this.onSubmit}>
						<FormInput label="Account Holder Name (✳)" maxLength="40" type="text" value={this.state.form.account_holder_name} name="account_holder_name" onChange={this.inputChanged} errors={this.state.errors.account_holder_name} readOnly={this.state.saving}/>
						<FormInput label="Account Number (✳)" maxLength="20" type="text" value={this.state.form.account_number} name="account_number" onChange={this.inputChanged} errors={this.state.errors.account_number} readOnly={this.state.saving}/>
						<FormInput label="IFSC Code (✳)" maxLength="11" type="text" value={this.state.form.ifsc_code} name="ifsc_code" onChange={this.inputChanged} errors={this.state.errors.ifsc_code} readOnly={this.state.saving}/>
						<FormInput label="Pan Number (✳)" maxLength="10" type="text" value={this.state.form.pan_number} name="pan_number" onChange={this.inputChanged} errors={this.state.errors.pan_number} readOnly={this.state.saving}/>
						<SaveButton/>
					</form>
				}
			</Modal>
		);
	}
}

var mapStoreToProps = function(store){
	return {
		bankInfo: store.bankInfo,
	};
};

export default connect( mapStoreToProps)(BankInfoForm);
