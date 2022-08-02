import React, { Component } from "react";
import * as ReactRedux from "react-redux";
import { hashHistory } from "react-router";
import PropTypes from "prop-types";
import Alert from "react-s-alert";

import {  saveAuditCycleAddForm } from "../../actions/audit.js";
import { fetchQuestionnaireTypes } from "../../service/questionnaire_type.js";

import { getAuditType } from "../../../utils.js";
import { affectInputEventToComponent } from "../../../react_utils.js";
import FormInput from "../../../components/FormInput.jsx";
import { FormDateInput } from "../../../components/FormInput.jsx";
import FormTextarea from "../../../components/FormTextarea.jsx";
import FormSelect from "../../../components/FormSelect.jsx";
import SaveButton from "../../../components/SaveButton.jsx";
import MarkdownViewer from "../../../components/MarkdownViewer.jsx";
import { find_audit_cycle_for_quotation } from "../../service/quotation.js";


class AuditCycleForm extends Component{
	static propTypes = {
		quotation: PropTypes.object,
		clientId: PropTypes.number,
		dispatch: PropTypes.func.isRequired,
	};

	state = {
		// form_disabled: false,
		audit_auto_approve: true,
		status: "PREPARATION",
		questionnaire_type: "",
		planned_audit: 0,
		errors: {}
	};

	componentDidMount() {
		if(this.props.clientId && Object.keys(this.props.quotation).length > 0){
			this.find_audit_cycle_for_quotation_id(this.props.quotation.id);
			this.loadQuestionnaireTypes(this.props.quotation);
			let planned_audits = 0;
			for(let i of this.props.quotation.audit_locations){
				planned_audits += i.count;
			}
			this.setState({
				client: this.props.clientId,
				quotation: this.props.quotation.id,
				planned_audit: planned_audits,
			});
		}
	}

	componentWillReceiveProps(nextProps) {
		if(Object.keys(nextProps.quotation).length > 0){
			let quotation = nextProps.quotation;
			this.find_audit_cycle_for_quotation_id(quotation.id);
			this.loadQuestionnaireTypes(quotation);
			let planned_audits = 0;
			for(let i of quotation.audit_locations){
				planned_audits += i.count;
			}
			this.setState({
				client: nextProps.clientId,
				quotation: quotation.id,
				planned_audit: planned_audits,
			});
		}
	}

	find_audit_cycle_for_quotation_id = (quotation_id) => {
		find_audit_cycle_for_quotation(quotation_id).then((audit_cycle) => {
			if(audit_cycle){
				hashHistory.push("/project_setup/audit_cycle_preview");
			}
		}).fail(()=>Alert.warning("Please create audit cycle"));
	};

	loadQuestionnaireTypes = (quotation) => {
		let sample_questionnaire_type = quotation.sample_questionnaire_type;
		fetchQuestionnaireTypes().then((questionnaireTypes) => {
			let questionnaire_type = questionnaireTypes.find(e => e.name == sample_questionnaire_type.name);
			if(questionnaire_type){
				this.setState({questionnaire_type: questionnaire_type.id});
			}
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
		promise = this.props.dispatch(saveAuditCycleAddForm(this.state));
		promise.then(function(){
			Alert.success("AUDIT CYCLE SAVED");
			hashHistory.push("/project_setup/audit_cycle_preview");
		}, (errors) => {
			if (errors.responseJSON){
				this.setState({
					errors: errors.responseJSON
				});
			}
		});
	};

	render(){
		return (
			<div className="container-fluid">
				<div className="panel panel-default">
					<div className="panel-heading"><b>Enter audit details</b></div>
					<div className="panel-body">
						<form onSubmit={this.onSubmit}>
							<div className="row">
								<div className="col-md-4">
									<FormInput label="Audit Cycle Name" type="text" value={this.state.name} name="name" onChange={this.fieldChanged} errors={this.state.errors.name} disabled={this.state.form_disabled} />
								</div>
								<div className="col-md-4">
									<FormDateInput label="Start Date" value={this.state.start_date} name="start_date" onChange={this.startDateChanged} errors={this.state.errors.start_date} disabled={this.state.form_disabled} />
								</div>
								<div className="col-md-4">
									<FormDateInput label="End Date" value={this.state.end_date} name="end_date" onChange={this.endDateChanged} errors={this.state.errors.end_date} disabled={this.state.form_disabled} />
								</div>
								<div className="col-md-4">
									<FormSelect label="Audit Type" name="type" value={this.state.type} onChange={this.fieldChanged} errors={this.state.errors.type} disabled={this.state.form_disabled} >
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
								<div className="col-md-12">
									<FormTextarea label="Description (markdown)" name="description" value={this.state.description} onChange={this.fieldChanged} errors={this.state.errors.description} disabled={this.state.form_disabled} />
								</div>
								{this.state.description ?
									<div className="col-md-12">
										<label>Preview:</label>
										<MarkdownViewer markdown={this.state.description}/>
									</div>
									: null}
							</div>
							<SaveButton/>
						</form>
					</div>
				</div>
			</div>
		);
	}
}

var mapStoreToProps = function(store){
	return {
		clientId: store.client.id,
		quotation: store.quotation || {},
		errors: store.forms.auditCycle.errors,
	};
};

export default ReactRedux.connect( mapStoreToProps)(AuditCycleForm);