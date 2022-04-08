import React from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";

import { fetchAuditCycles } from "../../actions/audit.js";
import { copySectionsFromTo } from "../../service/section.js";

import { affectInputEventToComponent } from "../../../react_utils.js";
import FormErrorList from "../../../components/FormErrorList.jsx";
import FormSelect from "../../../components/FormSelect.jsx";
import Modal from "../../../components/Modal.jsx";
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


export class __SectionCopyForm extends React.Component {
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
		selectedAuditCycleId: "",
		errors: {},
		submitting: false,
	};

	componentDidMount() {
		if(this.props.auditCycle){
			this.props.fetchAuditCycles(this.props.auditCycle.client.id);
		}
	}

	inputChanged = (e) => {
		affectInputEventToComponent(e, this);
	};

	setSubmitting = (submitting) => this.setState((prevState) => Object.assign({}, prevState, { submitting }));

	onSubmit = (e) => {
		e.preventDefault();
		this.setSubmitting(true);
		copySectionsFromTo(this.state.selectedAuditCycleId, this.props.auditCycle.id).then(() => {
			this.setSubmitting(false);
			this.props.router.push(`/audit_cycle/${this.props.auditCycle.id}/questionnaire`);
		}, (err) => {
			this.setSubmitting(false);
			err.responseJSON && this.setState({ errors: err.responseJSON });
		});
	};

	render() {
		const auditCycleOptions = this.props.otherAuditCycles.map(ac => <option key={ac.id} value={ac.id}>{ac.name} - {ac.questionnaire_type && ac.questionnaire_type.name}</option>);
		return (
			<Modal modalTitle="Copy Sections" onClose={this.props.router.goBack}>
				<FormErrorList errors={this.state.errors.non_field_errors}/>
				<form onSubmit={this.onSubmit}>
					<FormSelect label="Audit Cycle" value={this.state.selectedAuditCycleId} name="selectedAuditCycleId" onChange={this.inputChanged} errors={this.state.errors.from_audit_cycle_id} disabled={this.state.submitting}>
						<option value="">Select Audit Cycle</option>
						{auditCycleOptions}
					</FormSelect>
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

export default connect(mapStoreToProps, mapDispatchToProps)(__SectionCopyForm);
