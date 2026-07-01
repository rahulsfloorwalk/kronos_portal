import React from "react";
import PropTypes from "prop-types";
import * as ReactRedux from "react-redux";
import { hashHistory } from "react-router";

import Alert from "react-s-alert";

import { loadAuditAddForm, loadAuditEditForm, saveAuditEditForm, saveAuditAddForm, fetchAudits } from "../actions/audit.js";
import {fetchRemainingStores} from "../actions/remaining_store.js";

import { affectInputEventToComponent } from "../../react_utils.js";
import FormTextarea from "../../components/FormTextarea.jsx";
import FormInput from "../../components/FormInput.jsx";
import SaveButton from "../../components/SaveButton.jsx";
import Modal from "../../components/Modal.jsx";
import StoreSelector from "../../components/StoreSelector.jsx";
import FormErrorList from "../../components/FormErrorList.jsx";
import MarkdownViewer from "../../components/MarkdownViewer.jsx";
import { fetchClientTrainers,fetchClientDetails } from "../service/client_trainer.js";
import FormSelect from "../../components/FormSelect.jsx";

import { auditPropType, auditCyclePropType, errorList } from "../prop_types";

class AuditForm extends React.Component {
	static propTypes = {
		dispatch: PropTypes.func.isRequired,
		params: PropTypes.shape({
			auditCycleId: PropTypes.string,
			auditId: PropTypes.string,
		}),
		audit: auditPropType,
		auditCycle: auditCyclePropType,
		remainingStores: PropTypes.object,
		errors: PropTypes.shape({
			non_field_errors: errorList,
			addStore: errorList,
			earnings_per_audit: errorList,
			reimbursement: errorList,
			count: errorList,
			post_approval_description: errorList,
		}),
	};
	state = {
		trainers : [],
	};

	componentDidMount() {
		this.props.dispatch(fetchRemainingStores(this.props.params.auditCycleId));
		if(this.props.params.auditId){
			this.props.dispatch(loadAuditEditForm(this.props.params.auditId));
		} else {
			this.props.dispatch(loadAuditAddForm());
		}
		this.setState({
			audit_cycle: this.props.params.auditCycleId
		});
		fetchClientDetails((this.props.params.auditCycleId))
			.then((client) => {
				const clientId = client.id;
				fetchClientTrainers(clientId).then((trainers) => {
					this.setState({ trainers });
				});
			});
	}

	componentWillReceiveProps(nextProps) {
		if( nextProps.audit){
			this.setState(nextProps.audit);
			this.setState({
				addStore: nextProps.audit.store.id
			});
		}
		this.setState({
			audit_cycle: nextProps.params.auditCycleId
		});
		if(nextProps.auditCycle && ! nextProps.audit){
			this.setState({
				earnings_per_audit: nextProps.auditCycle.earnings_per_audit,
				reimbursement: nextProps.auditCycle.reimbursement,
			});
		}
	}

	inputChanged = (e) => {
		affectInputEventToComponent(e, this);
	};

	handleChange = (e) => {
		if (e!=null){
			this.setState({
				addStore : e != null ? e.map(val=>val.value) : [],
			});
		}
	};

	onSubmit = (e) => {
		e.preventDefault();
		let submitPromise;
		if(this.props.params.auditId){
			submitPromise = this.props.dispatch(saveAuditEditForm(this.state));
		} else {
			submitPromise = this.props.dispatch(saveAuditAddForm(this.state));
		}
		submitPromise.then(() => {
			this.props.dispatch(fetchAudits(this.props.params.auditCycleId));
			hashHistory.push(`/audit_cycle/${this.props.params.auditCycleId}/audit`);
			Alert.success("AUDIT SAVED");
		});
	};
	render() {
		let id = this.props.params.auditId;
		var modalTitle = this.props.params.auditId ? "Edit Audit" : "Add Audit";
		let selector = this.state.store && this.props.params.auditId  ? <StoreSelector auditId={id}  value={this.state.store}/> : <StoreSelector values={this.state.addStore} onChange={this.handleChange} />;
		return (
			<Modal modalTitle={modalTitle} onClose={hashHistory.goBack}>
				<form onSubmit={this.onSubmit}>
					<FormErrorList errors={this.props.errors.non_field_errors}/>
					{selector}
					<div className="row">
						<div className="col-sm-12">
							<FormSelect
								label="Select Trainer"
								name="client_trainer"
								value={this.state.client_trainer}
								onChange={this.inputChanged}
							>
								<option value=""></option>
								{this.state.trainers && this.state.trainers.length>0  && this.state.trainers.map((client_trainer) => (
									<option key={client_trainer.id} value={client_trainer.id}>
										{client_trainer.user.trainer.email}
									</option>
								))}
							</FormSelect>
						</div>
					</div>
					<div className="row">
						<div className="col-sm-6">
							<FormInput label="Audit Fees (₹)" type="number" value={this.state.earnings_per_audit} name="earnings_per_audit" onChange={this.inputChanged} errors={this.props.errors.earnings_per_audit}/>
						</div>
						<div className="col-sm-6">
							<FormInput label="Reimbursement upto (₹)" type="number" value={this.state.reimbursement} name="reimbursement" onChange={this.inputChanged} errors={this.props.errors.reimbursement}/>
						</div>
					</div>
					<FormInput label="Number of Audits" type="number" value={this.state.count} name="count" onChange={this.inputChanged} errors={this.props.errors.count}/>
					<FormTextarea label="Description (markdown)" name="post_approval_description" value={this.state.post_approval_description} onChange={this.inputChanged} errors={this.props.errors.post_approval_description}/>
					<div>
						<label>Preview:</label>
						<MarkdownViewer markdown={this.state.post_approval_description}/>
					</div>
					<SaveButton/>
				</form>
			</Modal>
		);
	}
}

var mapStoreToProps = function(remainingStore,ownProps){
	return {
		auditCycle: remainingStore.auditCycles[ownProps.params.auditCycleId],
		audit: remainingStore.audits[ownProps.params.auditId],
		remainingStores: remainingStore.remainingStore,
		errors: remainingStore.forms.audit.errors,
	};
};

export default ReactRedux.connect( mapStoreToProps)(AuditForm);
