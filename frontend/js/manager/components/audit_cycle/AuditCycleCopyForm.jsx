import React, { Component } from "react";
import { hashHistory } from "react-router";
import { connect } from "react-redux";
import PropTypes from "prop-types";

import Alert from "react-s-alert";

import { fetchAuditCycles } from "../../actions/audit.js";

import { copyAuditDetailsFromTo } from "../../service/audit_cycle.js";

import { affectInputEventToComponent } from "../../../react_utils.js";
import FormInput from "../../../components/FormInput.jsx";
import FormSelect from "../../../components/FormSelect.jsx";
import FormErrorList from "../../../components/FormErrorList.jsx";
import Modal from "../../../components/Modal.jsx";
import {Duplicate} from "../../../components/Icons.jsx";

const auditCycleProp = PropTypes.shape({
	id: PropTypes.number.isRequired,
	name: PropTypes.string.isRequired,
	client: PropTypes.shape({
		id: PropTypes.number.isRequired,
		name: PropTypes.string.isRequired,
	}).isRequired,
	questionnaire_type: PropTypes.shape({
		id: PropTypes.number.isRequired,
		name: PropTypes.string.isRequired,
	}),
});

class AuditCycleCopyForm extends Component{
	static propTypes = {
		auditCycle: auditCycleProp,
		otherAuditCycles: PropTypes.arrayOf(auditCycleProp),
		fetchAuditCycles: PropTypes.func.isRequired,
	};

	state = {
		selectedAuditCycleId : "",
		checkpoints: true,
		post_approval_desc: true,
		audit_alignment_factors: true,
		proof_tags: true,
		submitting: false,
		errors: {},
	};

	componentDidMount() {
		if(this.props.auditCycle){
			this.props.fetchAuditCycles(this.props.auditCycle.client.id);
		}
	}

	setSubmitting = (submitting) => this.setState((prevState) => Object.assign({}, prevState, { submitting }));

	fieldChanged = (e) => {
		affectInputEventToComponent(e, this);
	};

	onSubmit = (e) => {
		e.preventDefault();
		this.setSubmitting(true);
		copyAuditDetailsFromTo(this.state, this.props.auditCycle.id).then(() => {
			this.setSubmitting(false);
			hashHistory.push(`/audit_cycle/${this.props.auditCycle.id}/questionnaire`);
			Alert.success("Audit Cycle Details Copied");
		}, (err) => {
			this.setSubmitting(false);
			err.responseJSON && this.setState({ errors: err.responseJSON });
		});
	};

	render(){
		const auditCycleOptions = this.props.otherAuditCycles.map(ac => <option key={ac.id} value={ac.id}>{ac.name} - {ac.questionnaire_type && ac.questionnaire_type.name}</option>);
		var modalTitle = "Copy Audit Cycle Details";
		return (
			<Modal modalTitle={modalTitle} onClose={hashHistory.goBack}>
				<FormErrorList errors={this.state.errors.non_field_errors}/>
				<form onSubmit={this.onSubmit}>
					<FormSelect label="Audit Cycle" value={this.state.selectedAuditCycleId} name="selectedAuditCycleId" onChange={this.fieldChanged} disabled={this.state.submitting}>
						<option value="">Select Audit Cycle</option>
						{auditCycleOptions}
					</FormSelect>
					<FormInput label="Check Point" type="checkbox" checked={this.state.checkpoints} name="checkpoints" onChange={this.fieldChanged}/>
					<FormInput label="Post Approval Description" type="checkbox" checked={this.state.post_approval_desc} name="post_approval_desc" onChange={this.fieldChanged}/>
					<FormInput label="Proof Tags" type="checkbox" checked={this.state.proof_tags} name="proof_tags" onChange={this.fieldChanged}/>
					<FormInput label="Audit alignment factors" type="checkbox" checked={this.state.audit_alignment_factors} name="audit_alignment_factors" onChange={this.fieldChanged}/>
					<button className="btn btn-primary btn-lg" disabled={this.state.submitting}>
						<Duplicate/> Copy
					</button>
				</form>
			</Modal>
		);
	}
}

const mapStoreToProps = (store, ownProps) => {
	return {
		auditCycle: store.auditCycles[ownProps.params.auditCycleId],
		otherAuditCycles: ((auditCycles) => {
			let selectedCycles = [];
			for( const id in auditCycles){
				if( auditCycles[id].id !== parseInt(ownProps.params.auditCycleId)){
					selectedCycles.push(auditCycles[id]);
				}
			}
			return selectedCycles;
		})(store.auditCycles)
	};
};

const mapDispatchToProps = (dispatch) => {
	return {
		fetchAuditCycles: (clientId) => {
			dispatch(fetchAuditCycles(clientId));
		},
	};
};

export default connect(mapStoreToProps, mapDispatchToProps)(AuditCycleCopyForm);