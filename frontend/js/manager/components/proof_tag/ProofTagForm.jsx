import React from "react";
import PropTypes from "prop-types";
import { hashHistory } from "react-router";

import { findById, insert, update } from "../../service/proof_tag.js";

import { getInputEventChangeValue } from "../../../react_utils.js";
import FormInput from "../../../components/FormInput.jsx";
import SaveButton from "../../../components/SaveButton.jsx";
import Modal from "../../../components/Modal.jsx";
import Loading from "../../../components/Loading.jsx";
import FormErrorList from "../../../components/FormErrorList.jsx";

export default class ProofTagForm extends React.Component {
	static propTypes = {
		params: PropTypes.shape({
			proof_tag_id: PropTypes.string,
		}),
	};

	state = {
		loading: false,
		proof_tag: {
			name: "",
			description: "",
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
		if(this.props.params.proof_tag_id){
			this.setLoading(true);
			findById(this.props.params.proof_tag_id).then( (proof_tag) => {
				this.setState({
					proof_tag: Object.assign({}, proof_tag)
				});
			}).always(() => this.setLoading(false));
		}
	}

	fieldChanged = (e) => {
		this.setState({
			proof_tag: Object.assign({}, this.state.proof_tag, getInputEventChangeValue(e))
		});
	};

	onSubmit = (e) => {
		e.preventDefault();
		var promise;
		if(this.props.params.proof_tag_id){
			promise = update(
				this.props.params.proof_tag_id,
				this.state.proof_tag.name,
				this.state.proof_tag.description,
				this.state.proof_tag.is_active);
		} else {
			promise = insert(
				this.state.proof_tag.name,
				this.state.proof_tag.description,
				this.state.proof_tag.is_active);
		}
		promise.then(function(){
			hashHistory.push("/proof_tag");
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
		var modalTitle = this.props.params.proof_tag_id ? "Edit Proof Tag" : "Add Proof Tag";
		return (
			<Modal modalTitle={modalTitle} onClose={hashHistory.goBack}>
				<form onSubmit={this.onSubmit}>
					<FormErrorList errors={this.state.errors.non_field_errors}/>
					<FormInput label="Proof Tag" type="text" value={this.state.proof_tag.name} name="name" onChange={this.fieldChanged} errors={this.state.errors.name}/>
					<FormInput label="Description" type="text" value={this.state.proof_tag.description} name="description" onChange={this.fieldChanged} errors={this.state.errors.description} />
					<FormInput label="Active?" type="checkbox" checked={this.state.proof_tag.is_active} name="is_active" onChange={this.fieldChanged} errors={this.state.errors.is_active}/>
					<SaveButton/>
				</form>
			</Modal>
		);
	}
}
