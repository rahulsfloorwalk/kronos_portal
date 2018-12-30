import React from "react";
import PropTypes from "prop-types";
import * as ReactRedux from "react-redux";
import { hashHistory } from "react-router";
import Datetime from "react-datetime";

import moment from "moment";

import { momentDateFormat }  from "../../../config.js";

import { loadAuditApplyForm, submitAuditApplyForm } from "../actions/application.js";

import FormErrorList from "../../components/FormErrorList.jsx";
import Modal from "../../components/Modal.jsx";

import { auditPropType } from "../prop_types";

class AuditApplyForm extends React.Component {
	static propTypes = {
		dispatch: PropTypes.func.isRequired,
		params: PropTypes.shape({
			auditId: PropTypes.string.isRequired,
		}),
		audit: auditPropType,
		errors: PropTypes.shape({
			audit_date: PropTypes.arrayOf(PropTypes.string),
			non_field_errors: PropTypes.arrayOf(PropTypes.string),
		}),
	};

	state = {
		submitting: false,
	};

	setSubmitting = (submitting) => {
		this.setState((prevState) => Object.assign({}, prevState, { submitting }));
	};

	componentDidMount() {
		this.props.dispatch(loadAuditApplyForm(this.props.params.auditId));
	}

	dateChanged = (date) => {
		if( typeof date !== "string"){
			this.setState({
				audit_date: date
			});
		}
	};

	onSubmit = (e) => {
		e.preventDefault();
		this.setSubmitting(true);
		this.props.dispatch(submitAuditApplyForm({
			audit_id: this.props.audit.id,
			audit_date: this.state.audit_date ? this.state.audit_date.format("YYYY-MM-DD") : "",
		})).done(() => hashHistory.push(`/audit/cycle/${this.props.audit.audit_cycle.id}`)).always(() => this.setSubmitting(false));
	};

	isValidDate = (currentDate) => {
		let startDate = moment(this.props.audit.audit_cycle.start_date);
		let endDate = moment(this.props.audit.audit_cycle.end_date);
		return currentDate.isBetween(startDate, endDate, null, "[]"); //inclusive
	};

	render() {
		return (
			<Modal modalTitle={`Apply for Audit at ${this.props.audit.store.city.name}`} onClose={hashHistory.goBack}>
				<form onSubmit={this.onSubmit}>
					<FormErrorList errors={this.props.errors.non_field_errors}/>
					<p className="text-center">
						<big>{ moment(this.props.audit.audit_cycle.start_date).format(momentDateFormat) }</big> to <big>{ moment(this.props.audit.audit_cycle.end_date).format(momentDateFormat) }</big>
					</p>
					<style dangerouslySetInnerHTML={{__html:".rdtPicker{ margin-left:auto; margin-right:auto; }"}}/>
					<Datetime style={{marginLeft:"auto",marginRight:"auto"}}
						timeFormat={false} dateFormat="YYYY-MM-DD"
						closeOnSelect={false} closeOnTab={false} disableOnClickOutside={true}
						open={true} input={false}
						name="audit_date"
						value={this.state.audit_date}
						onChange={this.dateChanged}
						isValidDate={this.isValidDate}
					/>
					<FormErrorList errors={this.props.errors.audit_date}/>
					<button className="btn btn-lg btn-primary btn-block" disabled={!this.state.audit_date || this.state.submitting}>
						{ this.state.submitting ? "applying..." :
							<span>Apply{ this.state.audit_date ? <span> for <b>{this.state.audit_date.format(momentDateFormat)}</b></span> : null }</span> }
					</button>
				</form>
			</Modal>
		);
	}
}

var mapStoreToProps = function(store, ownProps){
	return {
		audit: store.audits[ownProps.params.auditId],
		errors: store.forms.auditApply.errors || {},
	};
};

export default ReactRedux.connect( mapStoreToProps)(AuditApplyForm);
