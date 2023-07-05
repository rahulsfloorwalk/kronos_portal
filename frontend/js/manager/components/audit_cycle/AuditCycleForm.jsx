import React, { Component } from "react";
import * as ReactRedux from "react-redux";
import { hashHistory } from "react-router";
import PropTypes from "prop-types";

import Alert from "react-s-alert";

import {  loadAuditCycleAddForm, loadAuditCycleEditForm, saveAuditCycleAddForm, saveAuditCycleEditForm } from "../../actions/audit.js";
import { fetchQuestionnaireTypes } from "../../service/questionnaire_type.js";

import { getAuditType, getAuditStatus } from "../../../utils.js";
import { affectInputEventToComponent } from "../../../react_utils.js";
import FormInput from "../../../components/FormInput.jsx";
import { FormDateInput } from "../../../components/FormInput.jsx";
import FormSelect from "../../../components/FormSelect.jsx";
import FormTextarea from "../../../components/FormTextarea.jsx";
import SaveButton from "../../../components/SaveButton.jsx";
import Modal from "../../../components/Modal.jsx";
import MarkdownViewer from "../../../components/MarkdownViewer.jsx";

const FieldErrors = PropTypes.arrayOf(PropTypes.string);

export class AuditCycleForm extends Component{
	static propTypes = {
		params: PropTypes.shape({
			clientId: PropTypes.string,
			auditCycleId: PropTypes.string,
		}).isRequired,

		auditCycle: PropTypes.shape({
			name: PropTypes.string,
			start_date: PropTypes.string,
			end_date: PropTypes.string,
			type: PropTypes.string,
			status: PropTypes.string,
			planned_audit: PropTypes.number,
			earnings_per_audit: PropTypes.number,
			reimbursement: PropTypes.number,
			description: PropTypes.string,
			audit_auto_approve: PropTypes.bool,
			client: PropTypes.shape({
				id: PropTypes.number.isRequired,
				name: PropTypes.string.isRequired,
			}),
			questionnaire_type: PropTypes.shape({
				id: PropTypes.number.isRequired,
				name: PropTypes.string.isRequired,
				is_default: PropTypes.bool.isRequired,
			}),
		}),

		errors: PropTypes.shape({
			name: FieldErrors,
			start_date: FieldErrors,
			end_date: FieldErrors,
			type: FieldErrors,
			status: FieldErrors,
			planned_audit: FieldErrors,
			reimbursement: FieldErrors,
			earnings_per_audit: FieldErrors,
			description: FieldErrors,
			audit_auto_approve: FieldErrors,
			questionnaire_type: FieldErrors,
		}).isRequired,

		dispatch: PropTypes.func.isRequired,
	};

	state = {
		questionnaireTypes: [],
	};

	componentDidMount() {
		if(this.props.params.auditCycleId){
			this.props.dispatch(loadAuditCycleEditForm(this.props.params.auditCycleId));
		} else {
			this.setState({
				"client": this.props.params.clientId
			});
			this.loadQuestionnaireTypes(this.props.params.clientId);
			this.props.dispatch(loadAuditCycleAddForm());
		}
	}
	componentWillReceiveProps(nextProps) {
		if(nextProps.auditCycle){
			this.setState(nextProps.auditCycle);
			if(nextProps.auditCycle.client){
				this.setState({
					"client": nextProps.auditCycle.client.id,
				});
				this.loadQuestionnaireTypes(nextProps.auditCycle.client.id);
			}
			if(nextProps.auditCycle.questionnaire_type){
				this.setState({
					"questionnaire_type": nextProps.auditCycle.questionnaire_type.id,
				});
			}
		} else {
			this.setState({
				"client": nextProps.params.clientId
			});
			this.loadQuestionnaireTypes(nextProps.params.clientId);
		}
	}

	loadQuestionnaireTypes = (clientId) => {
		fetchQuestionnaireTypes(clientId).then((questionnaireTypes) => {
			this.setState({questionnaireTypes});
		});
	};

	fieldChanged = (e) => {
		affectInputEventToComponent(e, this);
	};

	dateChanged = (name, date) => {
		if( typeof date !== "string"){
			this.setState({
				[name]: date.format("YYYY-MM-DD")
			});
		}
	};

	startDateChanged = (date) => {
		this.dateChanged("start_date",date);
	};

	endDateChanged = (date) => {
		this.dateChanged("end_date",date);
	};

	onSubmit = (e) => {
		e.preventDefault();
		var promise;
		if(this.props.params.auditCycleId){
			promise = this.props.dispatch(saveAuditCycleEditForm(this.state));
		} else {
			promise = this.props.dispatch(saveAuditCycleAddForm(this.state));
		}
		promise.then(function(savedAuditCycle){
			hashHistory.push(`/audit_cycle/${savedAuditCycle.id}/questionnaire`);
			Alert.success("AUDIT CYCLE SAVED");
		});
	};

	render(){
		var modalTitle = this.props.params.auditCycleId ? "Edit Audit Cycle" : "Add Audit Cycle";
		return (
			<Modal modalTitle={modalTitle} onClose={hashHistory.goBack}>
				<form onSubmit={this.onSubmit}>
					<div className="row">
						<div className="col-md-6">
							<FormInput label="Audit Cycle Name" type="text" value={this.state.name} name="name" onChange={this.fieldChanged} errors={this.props.errors.name}/>
						</div>
						<div className="col-md-6">
							<FormSelect label="Questionnaire Type" name="questionnaire_type" value={this.state.questionnaire_type} onChange={this.fieldChanged} errors={this.props.errors.questionnaire_type}>
								<option value=""></option>
								{this.state.questionnaireTypes.map(qt => <option key={qt.id} value={qt.id}>{qt.name}</option>)};
							</FormSelect>
						</div>
					</div>
					<div className="row">
						<div className="col-md-6">
							<FormDateInput label="Start Date" value={this.state.start_date} name="start_date" onChange={this.startDateChanged} errors={this.props.errors.start_date}/>
						</div>
						<div className="col-md-6">
							<FormDateInput label="End Date" value={this.state.end_date} name="end_date" onChange={this.endDateChanged} errors={this.props.errors.end_date}/>
						</div>
					</div>
					<div className="row">
						<div className="col-md-6">
							<FormSelect label="Audit Type" name="type" value={this.state.type} onChange={this.fieldChanged} errors={this.props.errors.type}>
								<option value=""></option>
								<option value="WALKIN">{getAuditType("WALKIN")}</option>
								<option value="PHONE">{getAuditType("PHONE")}</option>
								<option value="WEB">{getAuditType("WEB")}</option>
								<option value="VISIBILITY">{getAuditType("VISIBILITY")}</option>
								<option value="COMPETITION">{getAuditType("COMPETITION")}</option>
								<option value="SERVICE">{getAuditType("SERVICE")}</option>
								<option value="SALES">{getAuditType("SALES")}</option>
								<option value="SMAAASH_ARENA">{getAuditType("SMAAASH_ARENA")}</option>
								<option value="FINE_DINE">{getAuditType("FINE_DINE")}</option>
								<option value="SKY_KARTING">{getAuditType("SKY_KARTING")}</option>
								<option value="GENERAL">{getAuditType("GENERAL")}</option>
								<option value="SMAAASH">{getAuditType("SMAAASH")}</option>
								<option value="SMAAASH_MEGA">{getAuditType("SMAAASH_MEGA")}</option>
								<option value="SMAAASH_ZONE">{getAuditType("SMAAASH_ZONE")}</option>
								<option value="DDC">{getAuditType("DDC")}</option>
								<option value="HTC">{getAuditType("HTC")}</option>
								<option value="ASCVD">{getAuditType("ASCVD")}</option>
								<option value="SKIN_HYDRATION">{getAuditType("SKIN_HYDRATION")}</option>
								<option value="HYPER_PIGMENTATION">{getAuditType("HYPER_PIGMENTATION")}</option>
								<option value="SKIN_SENSITIVE">{getAuditType("SKIN_SENSITIVE")}</option>
								<option value="RETAIL">{getAuditType("RETAIL")}</option>
							</FormSelect>
						</div>
						<div className="col-md-6">
							<FormSelect label="Audit Status" name="status" value={this.state.status} onChange={this.fieldChanged} errors={this.props.errors.status}>
								<option value=""></option>
								<option value="PREPARATION">{getAuditStatus("PREPARATION")}</option>
								<option value="UPCOMING">{getAuditStatus("UPCOMING")}</option>
								<option value="ACTIVE">{getAuditStatus("ACTIVE")}</option>
								<option value="REPORT">{getAuditStatus("REPORT")}</option>
								<option value="CLEARING">{getAuditStatus("CLEARING")}</option>
								<option value="ARCHIVED">{getAuditStatus("ARCHIVED")}</option>
							</FormSelect>
						</div>
					</div>
					<div className="row">
						<div className="col-md-6">
							<FormInput label="Earnings Per Audit (₹)" type="number" value={this.state.earnings_per_audit} name="earnings_per_audit" onChange={this.fieldChanged} errors={this.props.errors.earnings_per_audit}/>
						</div>
						<div className="col-md-6">
							<FormInput label="Reimbursement upto (₹)" type="number" value={this.state.reimbursement} name="reimbursement" onChange={this.fieldChanged} errors={this.props.errors.reimbursement}/>
						</div>
						<div className="col-md-6">
							<FormInput label="Planned audit" type="number" value={this.state.planned_audit} name="planned_audit" onChange={this.fieldChanged} errors={this.props.errors.planned_audit}/>
						</div>
						<div className="col-md-6">
							<FormInput label="Audit auto approve" type="checkbox" checked={this.state.audit_auto_approve} name="audit_auto_approve" onChange={this.fieldChanged} errors={this.props.errors.audit_auto_approve}/>
						</div>
					</div>
					<FormTextarea label="Description (markdown)" name="description" value={this.state.description} onChange={this.fieldChanged} errors={this.props.errors.description}/>
					<div>
						<label>Preview:</label>
						<MarkdownViewer markdown={this.state.description}/>
					</div>
					<SaveButton/>
				</form>
			</Modal>
		);
	}
}

var mapStoreToProps = function(store, ownProps){
	return {
		auditCycle: store.auditCycles[ownProps.params.auditCycleId] || {},
		errors: store.forms.auditCycle.errors,
	};
};

export default ReactRedux.connect( mapStoreToProps)(AuditCycleForm);
