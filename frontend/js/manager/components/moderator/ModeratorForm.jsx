import React from "react";
import PropTypes from "prop-types";
import { hashHistory } from "react-router";

import { findById, insert, update } from "../../service/moderator.js";

import { getInputEventChangeValue } from "../../../react_utils.js";
import FormInput from "../../../components/FormInput.jsx";
import SaveButton from "../../../components/SaveButton.jsx";
import Modal from "../../../components/Modal.jsx";
import Loading from "../../../components/Loading.jsx";
import FormErrorList from "../../../components/FormErrorList.jsx";

export default class ModeratorForm extends React.Component {
	static propTypes = {
		params: PropTypes.shape({
			userId: PropTypes.string,
		}),
	};

	state = {
		loading: false,
		moderator: {
			email: "",
			password: "",
			is_active: true
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
			findById(this.props.params.userId).then( (moderator) => {
				this.setState({
					moderator: Object.assign({}, moderator, {
						password: ""
					})
				});
			}).always(() => this.setLoading(false));
		}
	}

	fieldChanged = (e) => {
		this.setState({
			moderator: Object.assign({}, this.state.moderator, getInputEventChangeValue(e))
		});
	};

	onSubmit = (e) => {
		e.preventDefault();
		var promise;
		if(this.props.params.userId){
			promise = update(
				this.props.params.userId,
				this.state.moderator.email,
				this.state.moderator.password,
				this.state.moderator.is_active);
		} else {
			promise = insert(
				this.state.moderator.email,
				this.state.moderator.password,
				this.state.moderator.is_active);
		}
		promise.then(function(){
			hashHistory.push("/moderator");
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
		var modalTitle = this.props.params.userId ? "Edit Moderator" : "Add Moderator";
		let passwordPlaceholder = this.props.params.userId ? "leave blank to keep password unchanged" : "";
		return (
			<Modal modalTitle={modalTitle} onClose={hashHistory.goBack}>
				<form onSubmit={this.onSubmit}>
					<FormErrorList errors={this.state.errors.non_field_errors}/>
					<FormInput label="Email Address" type="email" value={this.state.moderator.email} name="email" onChange={this.fieldChanged} errors={this.state.errors.email}/>
					<FormInput label="Password" type="text" value={this.state.moderator.password} name="password" onChange={this.fieldChanged} errors={this.state.errors.password} placeholder={passwordPlaceholder}/>
					<FormInput label="Active?" type="checkbox" checked={this.state.moderator.is_active} name="is_active" onChange={this.fieldChanged} errors={this.state.errors.is_active}/>
					<SaveButton/>
				</form>
			</Modal>
		);
	}
}
