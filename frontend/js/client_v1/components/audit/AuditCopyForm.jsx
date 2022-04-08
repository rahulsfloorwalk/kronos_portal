import React from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import { hashHistory } from "react-router";

import Alert from "react-s-alert";

import { fetchAuditCycles } from "../../actions/audit.js";

import { copyAuditsFromTo } from "../../service/audit.js";

import { affectInputEventToComponent } from "../../../react_utils.js";
import FormSelect from "../../../components/FormSelect.jsx";
import Modal from "../../../components/Modal.jsx";
import FormErrorList from "../../../components/FormErrorList.jsx";
import { Duplicate } from "../../../components/Icons.jsx";

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


export class __AuditCopyForm extends React.Component {
	static propTypes = {
		auditCycle: auditCycleProp,
		otherAuditCycles: PropTypes.arrayOf(auditCycleProp),
		fetchAuditCycles: PropTypes.func.isRequired,
		router: PropTypes.shape({
			goBack: PropTypes.func.isRequired,
			push: PropTypes.func.isRequired,
		}),
	};


	state = {
		errors:{},
		selectedAuditCycleId: null
	};

	componentDidMount() {
		if(this.props.auditCycle){
			this.props.fetchAuditCycles(this.props.auditCycle.client.id);
		}
	}

	inputChanged = (e) => {
		affectInputEventToComponent(e, this);
	};

	onSubmit = (e) => {
		e.preventDefault();
		copyAuditsFromTo(this.state.selectedAuditCycleId, this.props.auditCycle.id).then((audits) => {
			Alert.success(`${audits.length} AUDITS COPIED`);
			hashHistory.push(`/audit_cycle/${this.props.auditCycle.id}/audit`);
		}, (err) => {
			this.setState({
				errors: err && err.responseJSON,
			});
		});
	};

	render() {
		const auditCycleOptions = this.props.otherAuditCycles.map(ac => <option key={ac.id} value={ac.id}>{ac.name} - {ac.questionnaire_type && ac.questionnaire_type.name}</option>);

		return (
			<Modal modalTitle="Copy Audits" onClose={hashHistory.goBack}>
				<form onSubmit={this.onSubmit}>
					<FormErrorList errors={this.state.errors.non_field_errors}/>
					<FormSelect label="Audit Cycle" value={this.state.selectedAuditCycleId} name="selectedAuditCycleId" onChange={this.inputChanged} required="true">
						<option value="">Select Audit Cycle</option>
						{auditCycleOptions}
					</FormSelect>
					<button className="btn btn-primary btn-lg">
						<Duplicate/> Copy Audits
					</button>
				</form>
			</Modal>
		);
	}
}

const mapStoreToProps = (store, ownProps) => {
	return {
		auditCycle: store.auditCycles[ownProps.params.auditCycleId],
		otherAuditCycles: (function(auditCycles){
			let selectedCycles = [];
			for( let id in auditCycles){
				if( auditCycles[id].id !== parseInt(ownProps.params.auditCycleId)){
					selectedCycles.push(auditCycles[id]);
				}
			}
			return selectedCycles;
		}(store.auditCycles))
	};
};

const mapDispatchToProps = (dispatch) => {
	return {
		fetchAuditCycles: (clientId) => {
			dispatch(fetchAuditCycles(clientId));
		},
	};
};

export default connect(mapStoreToProps, mapDispatchToProps)(__AuditCopyForm);
