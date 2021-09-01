import React from "react";
import PropTypes from "prop-types";
import * as ReactRedux from "react-redux";
import { hashHistory } from "react-router";

import Alert from "react-s-alert";

import { loadAuditAddForm, loadAuditEditForm, saveAuditEditForm, saveAuditAddForm, fetchAuditCycle, fetchAudits } from "../actions/audit.js";
import {fetchStores} from "../actions/store.js";

import { affectInputEventToComponent } from "../../react_utils.js";
import FormTextarea from "../../components/FormTextarea.jsx";
import FormInput from "../../components/FormInput.jsx";
import SaveButton from "../../components/SaveButton.jsx";
import Modal from "../../components/Modal.jsx";
import StoreSelector from "../../components/StoreSelector.jsx";
import FormErrorList from "../../components/FormErrorList.jsx";
import MarkdownViewer from "../../components/MarkdownViewer.jsx";

import { fetchCountry, fetchStatesByCountry } from "../actions/location.js";
import CountrySelector from "../../components/CountrySelector.jsx";
import StateSelector from "../../components/StateSelector.jsx";

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
		errors: PropTypes.shape({
			non_field_errors: errorList,
			store: errorList,
			earnings_per_audit: errorList,
			reimbursement: errorList,
			count: errorList,
			post_approval_description: errorList,
		}),
	};
	state = {
		state: "",
		audit_region: "city",
		country_error: [],
		state_error: []
	};

	componentDidMount() {
		this.props.dispatch(fetchCountry());
		this.props.dispatch(fetchAuditCycle(this.props.params.auditCycleId)).then( auditCycle => {
			this.props.dispatch(fetchStores(auditCycle.client.id));
		});
		if(this.props.params.auditId){
			this.props.dispatch(loadAuditEditForm(this.props.params.auditId));
		} else {
			this.props.dispatch(loadAuditAddForm());
		}
		this.setState({
			audit_cycle: this.props.params.auditCycleId
		});
	}

	componentWillReceiveProps(nextProps) {
		if( nextProps.audit){
			this.setState(nextProps.audit);
			this.setState({
				store: nextProps.audit.store.id
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

	onSubmit = (e) => {
		e.preventDefault();
		if(this.state.audit_region == "state"){
			if(typeof this.state.state == undefined || this.state.state == ""){
				this.setState({state_error: ["Please select state"]});
				return false;
			}
		}

		var submitPromise;
		if(this.props.params.auditId){
			submitPromise = this.props.dispatch(saveAuditEditForm(this.state));
		} else {
			submitPromise = this.props.dispatch(saveAuditAddForm(this.state));
		}
		submitPromise.then(() => {
			if(this.state.audit_region == "state" || this.state.audit_region == "country"){
				this.props.dispatch(fetchAudits(this.props.params.auditCycleId));
			}
			hashHistory.push(`/audit_cycle/${this.props.params.auditCycleId}/audit`);
			Alert.success("AUDIT SAVED");
		});
	};

	myCountryChanged = (e) => {
		this.inputChanged(e);
		var countryCode = e.target.value;
		if(countryCode){
			this.props.dispatch(fetchStatesByCountry(e.target.value));
			this.setState({
				"country_error": [],
				"state": "",
				"city": ""
			});
		}
	};

	setAuditRegion = (e) => {
		this.inputChanged(e);
		let value = e.target.valustoreIde;
		if(value == "country"){
			this.setState({state: "", store: ""});
		}
		else if(value == "state"){
			this.setState({store: ""});
		}
		else if(value == "city"){
			this.setState({country: "", state: ""});
		}
	};

	render() {
		var modalTitle = this.props.params.auditId ? "Edit Audit" : "Add Audit";
		return (
			<Modal modalTitle={modalTitle} onClose={hashHistory.goBack}>
				<form onSubmit={this.onSubmit}>
					<FormErrorList errors={this.props.errors.non_field_errors}/>
					{ typeof this.props.params.auditId == "undefined" || this.props.params.auditId == "" ?
						<div className="form-group">
							<label>Select audit region</label>
							<br />
							{/* <label htmlFor="id_country">
								<input type="radio" value="country" name="audit_region" defaultChecked={this.state.audit_region == "country"} id="id_country" onClick={this.setAuditRegion}/>&nbsp;Country
							</label>
							&nbsp;&nbsp; */}
							<label htmlFor="id_state">
								<input type="radio" value="state" name="audit_region" defaultChecked={this.state.audit_region == "state"} id="id_state" onClick={this.setAuditRegion} />&nbsp;State
							</label>
							&nbsp;&nbsp;
							<label htmlFor="id_city">
								<input type="radio" value="city" name="audit_region" defaultChecked={this.state.audit_region == "city"} id="id_city" onClick={this.setAuditRegion} />&nbsp;City
							</label>
						</div>
						: null }
					{this.state.audit_region == "country" || this.state.audit_region == "state" ?
						<CountrySelector value={this.state.country} onChange={this.myCountryChanged} errors={this.state.country_error}/>
						: null }
					{this.state.audit_region == "state" ?
						<StateSelector value={this.state.state} onChange={this.inputChanged} errors={this.state.state_error}/>
						: null }
					{this.state.audit_region == "city" ?
						<StoreSelector value={this.state.store} onChange={this.inputChanged} errors={this.props.errors.store}/>
						: null }
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

var mapStoreToProps = function(store, ownProps){
	return {
		auditCycle: store.auditCycles[ownProps.params.auditCycleId],
		audit: store.audits[ownProps.params.auditId],
		errors: store.forms.audit.errors,
	};
};

export default ReactRedux.connect( mapStoreToProps)(AuditForm);
