import React from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import { hashHistory } from "react-router";

import { fetchAuditCycles } from "../actions/audit.js";

import { copySectionsFromTo } from "../service/section.js";

import { affectInputEventToComponent } from "../../react_utils.js";
import FormSelect from "../../components/FormSelect.jsx";
import Modal from "../../components/Modal.jsx";
import { Duplicate } from "../../components/Icons.jsx";

const auditCycleProp = PropTypes.shape({
	id: PropTypes.number.isRequired,
	name: PropTypes.string.isRequired,
	client: PropTypes.shape({
		id: PropTypes.number.isRequired,
		name: PropTypes.string.isRequired,
	}).isRequired,
});


export class __SectionCopyForm extends React.Component {
	static propTypes = {
		auditCycle: auditCycleProp,
		otherAuditCycles: PropTypes.arrayOf(auditCycleProp),
		fetchAuditCycles: PropTypes.func.isRequired,
	};

	state = {
		selectedAuditCycleId: "",
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
		copySectionsFromTo(this.state.selectedAuditCycleId, this.props.auditCycle.id).then(() => {
			hashHistory.push(`/audit_cycle/${this.props.auditCycle.id}/questionnaire`);
		});
	};

	render() {
		const auditCycleOptions = this.props.otherAuditCycles.map(ac => <option key={ac.id} value={ac.id}>{ac.name}</option>);
		return (
			<Modal modalTitle="Copy Sections" onClose={hashHistory.goBack}>
				<form onSubmit={this.onSubmit}>
					<FormSelect label="Audit Cycle" value={this.state.selectedAuditCycleId} name="selectedAuditCycleId" onChange={this.inputChanged}>
						<option value="">Select Audit Cycle</option>
						{auditCycleOptions}
					</FormSelect>
					<button className="btn btn-primary btn-lg">
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

export default connect(mapStoreToProps, mapDispatchToProps)(__SectionCopyForm);
