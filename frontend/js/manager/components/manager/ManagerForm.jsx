import React from "react";
import PropTypes from "prop-types";
import { hashHistory } from "react-router";

import { findById, insert, update } from "../../service/manager.js";

import { getInputEventChangeValue } from "../../../react_utils.js";
import FormInput from "../../../components/FormInput.jsx";
import SaveButton from "../../../components/SaveButton.jsx";
import Modal from "../../../components/Modal.jsx";
import Loading from "../../../components/Loading.jsx";
import FormErrorList from "../../../components/FormErrorList.jsx";

export default class ManagerForm extends React.Component {
	static propTypes = {
		params: PropTypes.shape({
			userId: PropTypes.string,
		}),
	};

	state = {
		loading: false,
		manager: {
			email: "",
			password: "",
			is_active: true,
			name:"",
			mobile:"",
			is_admin: false,
		},
		errors: {
		}
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
			findById(this.props.params.userId).then( (manager) => {
				this.setState({
					manager: Object.assign({}, manager, {
						password: ""
					})
				});
			}).always(() => this.setLoading(false));
		}
	}

	fieldChanged = (e) => {
		this.setState({
			manager: Object.assign({}, this.state.manager, getInputEventChangeValue(e))
		});
	};

	onSubmit = (e) => {
		e.preventDefault();
		console.log(this.state.manager.is_admin)
		var promise;
		if(this.props.params.userId){
			promise = update(
				this.props.params.userId,
				this.state.manager.email,
				this.state.manager.password,
				this.state.manager.is_active,
				this.state.manager.name,
				this.state.manager.mobile,
				this.state.manager.is_admin);
		} else {
			promise = insert(
				this.state.manager.email,
				this.state.manager.password,
				this.state.manager.is_active,
				this.state.manager.name,
				this.state.manager.mobile,
				this.state.manager.is_admin);
		}
		promise.then(function(){
			hashHistory.push("/manager");
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
		var modalTitle = this.props.params.userId ? "Edit Manager" : "Add Manager";
		let passwordPlaceholder = this.props.params.userId ? "leave blank to keep password unchanged" : "";
		return (
			<Modal modalTitle={modalTitle} onClose={hashHistory.goBack}>
				<form onSubmit={this.onSubmit}>
					<FormErrorList errors={this.state.errors.non_field_errors}/>
					<FormInput label="Email Address" type="email" value={this.state.manager.email} name="email" onChange={this.fieldChanged} errors={this.state.errors.email}/>
					<FormInput label="Password" type="text" value={this.state.manager.password} name="password" onChange={this.fieldChanged} errors={this.state.errors.password} placeholder={passwordPlaceholder}/>
					<FormInput label="Name" type="text" value={this.state.manager.name} name="name" onChange={this.fieldChanged} errors={this.state.errors.name}/>
					<FormInput label="Mobile" type="text" value={this.state.manager.mobile} name="mobile" onChange={this.fieldChanged} errors={this.state.errors.mobile}/>
					<FormInput label="Active?" type="checkbox" checked={this.state.manager.is_active} name="is_active" onChange={this.fieldChanged} errors={this.state.errors.is_active}/>
					<FormInput label="Admin?" type="checkbox" checked={this.state.manager.is_admin} name="is_admin" onChange={this.fieldChanged} errors={this.state.errors.is_admin}/>
					<SaveButton/>
				</form>
			</Modal>
		);
	}
}
