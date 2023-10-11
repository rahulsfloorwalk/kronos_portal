import React from "react";
import PropTypes from "prop-types";
import * as ReactRedux from "react-redux";
import { hashHistory } from "react-router";

import Datetime from "react-datetime";
import "react-datetime/css/react-datetime.css";

import moment from "moment";

import { momentDateFormat }  from "../../../config.js";

import { submitAuditCancelForm,loadAuditCancelForm,submitAuditApplyForm } from "../actions/application.js";

import FormErrorList from "../../components/FormErrorList.jsx";
import Modal from "../../components/Modal.jsx";

import { auditPropType } from "../prop_types";


class AuditReapplyForm extends React.Component {
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
		this.props.dispatch(loadAuditCancelForm(this.props.params.auditId));
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
		var promise = this.props.dispatch(submitAuditCancelForm( this.props.audit.id));
		promise.then(() =>{
			this.props.dispatch(submitAuditApplyForm({
				audit_id: this.props.audit.id,
				audit_date: this.state.audit_date ? this.state.audit_date.format("YYYY-MM-DD") : "",
			})).done(() => {
				hashHistory.push("/applied_audits");
				window.location.reload();
			}).always(() => this.setSubmitting(false));
		});
	};

	isValidDate = (currentDate) => {
		const sDate= new Date();
		let hours = sDate.getHours();
		let minutes = sDate.getMinutes();
		let seconds = sDate.getSeconds();
		let current_time = hours + ":" + minutes + ":" + seconds;
		if (current_time>"12:00:00"){
			sDate.setDate(sDate.getDate());
		}
		else{
			sDate.setDate(sDate.getDate()-1);
		}
		const SevenDaysLaterDate=new Date();
		SevenDaysLaterDate.setDate(sDate.getDate() + 7);
		let eDate;
		if (SevenDaysLaterDate>new Date(this.props.audit.audit_cycle.end_date)){
			eDate=new Date(this.props.audit.audit_cycle.end_date);
		}
		else{
			eDate=SevenDaysLaterDate;
		}
		return currentDate.isBetween(sDate, eDate, null, "[]"); //inclusive
	};

	render() {
		const sDate= new Date();
		let hours = sDate.getHours();
		let minutes = sDate.getMinutes();
		let seconds = sDate.getSeconds();
		let current_time = hours + ":" + minutes + ":" + seconds;
		if (current_time>"12:00:00"){
			sDate.setDate(sDate.getDate()+1);
		}
		else{
			sDate.setDate(sDate.getDate());
		}
		const SevenDaysLaterDate=new Date();
		SevenDaysLaterDate.setDate(sDate.getDate() + 6);
		let eDate;
		if (SevenDaysLaterDate>new Date(this.props.audit.audit_cycle.end_date)){
			eDate=new Date(this.props.audit.audit_cycle.end_date);
		}
		else{
			eDate=SevenDaysLaterDate;
		}
		return (
			<Modal modalTitle={`Reapply for Audit at ${this.props.audit.store.city.name}`} onClose={hashHistory.goBack}>
				<form onSubmit={this.onSubmit}>
					<FormErrorList errors={this.props.errors.non_field_errors}/>
					<p className="text-center">
						<big>{ moment(sDate).format(momentDateFormat) }</big> to <big>{ moment(eDate).format(momentDateFormat) }</big>
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
							<span>Reapply{ this.state.audit_date ? <span> for <b>{this.state.audit_date.format(momentDateFormat)}</b></span> : null }</span> }
					</button>
				</form>
			</Modal>
		);
	}
}

var mapStoreToProps = function(store, ownProps){
	return {
		audit: store.audits[ownProps.params.auditId] || store.travel_audits[ownProps.params.auditId],
		errors: store.forms.auditApply.errors || {},
	};
};

export default ReactRedux.connect( mapStoreToProps)(AuditReapplyForm);
