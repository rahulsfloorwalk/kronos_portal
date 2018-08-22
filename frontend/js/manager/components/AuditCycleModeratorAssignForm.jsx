import React from "react";
import $ from "jquery";
import { hashHistory } from "react-router";

import { findModerators, assign } from "../service/moderator.js";

import FormSelect from "../../components/FormSelect.jsx";
import FormInput from "../../components/FormInput.jsx";
import FormGroup from "../../components/FormGroup.jsx";
import SaveButton from "../../components/SaveButton.jsx";
import Modal from "../../components/Modal.jsx";
import Loading from "../../components/Loading.jsx";
import FormErrorList from "../../components/FormErrorList.jsx";

export default class extends React.Component {
    state = {
    	loading: false,
    	moderators: [],
    	selectedModerator: {
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
    	findModerators().then( (moderators) => {
    		this.setState({
    			moderators
    		});
    	});
    }

    fieldChanged = (e) => {
    	this.setState({
    		moderator: Object.assign({}, this.state.moderator, getInputEventChangeValue(e))
    	});
    };

    onSubmit = (e) => {
    	e.preventDefault();
    	assign( this.props.params.auditCycleId,
    		this.state.selectedModerator.id
    	).then((savedModerator) => {
    		hashHistory.push(`/audit_cycle/${this.props.params.auditCycleId}/moderator`);
    	}, (errors) => {
    		if (errors.responseJSON){
    			this.setState({
    				errors: errors.responseJSON
    			});
    		}
    	});
    };

    selectModerator = (e) => {
    	this.setState({
    		selectedModerator: this.state.moderators.filter( m => m.id === parseInt(e.target.value))[0]
    	});
    };

    render() {
    	if(this.state.loading){
    		return (<Loading/>);
    	}
    	let modRows = [];
    	for( let m of this.state.moderators){
    		modRows.push(<option key={m.id} value={m.id}>{m.email}</option>);
    	}
    	return (
    		<Modal modalTitle="Assign Moderator" onClose={hashHistory.goBack}>
    			<form onSubmit={this.onSubmit}>
    				<FormErrorList errors={this.state.errors.non_field_errors}/>
    				<FormSelect value={this.state.selectedModerator.id} onChange={this.selectModerator}>
    					<option value="">Select Moderator</option>
    					{modRows}
    				</FormSelect>
    				<button className="btn btn-primary btn-lg">Assign</button>
    			</form>
    		</Modal>
    	);
    }
}
