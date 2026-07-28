import React from "react";
import PropTypes from "prop-types";
import { hashHistory } from "react-router";

import { findById, insert, update } from "../../service/trainer.js";

import { getInputEventChangeValue } from "../../../react_utils.js";
import FormInput from "../../../components/FormInput.jsx";
import SaveButton from "../../../components/SaveButton.jsx";
import Modal from "../../../components/Modal.jsx";
import Loading from "../../../components/Loading.jsx";
import FormErrorList from "../../../components/FormErrorList.jsx";

export default class TrainerForm extends React.Component {
	static propTypes = {
		params: PropTypes.shape({
			userId: PropTypes.string,
		}),
	};

	state = {
		loading: false,
		trainer: {
			name: "",
			firm_name: "",
			mobile: "",
			email: "",
			password: "",
			is_active: true
		},
		errors: {}
	};

	setLoading = (loadingState) => {
		this.setState((prevState) => {
			return Object.assign({}, prevState, {
				loading: loadingState
			});
		});
	};

	componentDidMount() {
		if(this.props.params.userId){
			this.setLoading(true);
			findById(this.props.params.userId).then((response) => {
				this.setState({
					trainer: Object.assign({}, response.trainer, {
						email: response.email,
						is_active: response.is_active,
						password: ""
					})
				});
			}).always(() => this.setLoading(false));
		}
	}

	fieldChanged = (e) => {
		this.setState({
			trainer: Object.assign({}, this.state.trainer, getInputEventChangeValue(e))
		});
	};

	onSubmit = (e) => {
		e.preventDefault();
		var promise;
		if(this.props.params.userId){
			promise = update(
				this.props.params.userId,
				this.state.trainer.name,
				this.state.trainer.firm_name,
				this.state.trainer.mobile,
				this.state.trainer.email,
				this.state.trainer.password,
				this.state.trainer.is_active);
		} else {
			promise = insert(
				this.state.trainer.name,
				this.state.trainer.firm_name,
				this.state.trainer.mobile,
				this.state.trainer.email,
				this.state.trainer.password,
				this.state.trainer.is_active);
		}
		promise.then(function(){
			hashHistory.push("/trainer/list");
		}, (errors) => {
			if (errors.responseJSON){
				this.setState({
					errors: errors.responseJSON
				});
			}
		});
	};

	render() {
		if(this.state.loading){
			return (<Loading/>);
		}
		var modalTitle = this.props.params.userId ? "Edit Trainer" : "Add Trainer";
		let passwordPlaceholder = this.props.params.userId ? "leave blank to keep password unchanged" : "";
		return (
			<Modal modalTitle={modalTitle} onClose={hashHistory.goBack}>
				<form onSubmit={this.onSubmit}>
					<FormErrorList errors={this.state.errors.non_field_errors}/>
					<FormInput label="Name" type="text" value={this.state.trainer.name} name="name" onChange={this.fieldChanged} errors={this.state.errors.name} />
					<FormInput label="Firm Name" type="text" value={this.state.trainer.firm_name} name="firm_name" onChange={this.fieldChanged} errors={this.state.errors.firm_name} />
					<FormInput label="Phone Number" type="text" value={this.state.trainer.mobile} name="mobile" onChange={this.fieldChanged} errors={this.state.errors.mobile} />
					<FormInput label="Email Address" type="email" value={this.state.trainer.email} name="email" onChange={this.fieldChanged} errors={this.state.errors.email}/>
					<FormInput label="Password" type="text" value={this.state.trainer.password} name="password" onChange={this.fieldChanged} errors={this.state.errors.password} placeholder={passwordPlaceholder}/>
					<FormInput label="Active?" type="checkbox" checked={this.state.trainer.is_active} name="is_active" onChange={this.fieldChanged} errors={this.state.errors.is_active}/>
					<SaveButton/>
				</form>
			</Modal>
		);
	}
}
