// import React from "react";
// import PropTypes from "prop-types";
// import * as ReactRedux from "react-redux";
// import { hashHistory } from "react-router";

// import Datetime from "react-datetime";
// import "react-datetime/css/react-datetime.css";

// import moment from "moment";

// import { momentDateFormat }  from "../../../config.js";

// import { loadAuditApplyForm, submitAuditApplyForm } from "../actions/application.js";

// import FormErrorList from "../../components/FormErrorList.jsx";
// import Modal from "../../components/Modal.jsx";

// import { auditPropType } from "../prop_types";


// class AuditApplyForm extends React.Component {
// 	static propTypes = {
// 		dispatch: PropTypes.func.isRequired,
// 		params: PropTypes.shape({
// 			auditId: PropTypes.string.isRequired,
// 		}),
// 		audit: auditPropType,
// 		errors: PropTypes.shape({
// 			audit_date: PropTypes.arrayOf(PropTypes.string),
// 			non_field_errors: PropTypes.arrayOf(PropTypes.string),
// 		}),
// 	};

// 	state = {
// 		submitting: false,
// 	};

// 	setSubmitting = (submitting) => {
// 		this.setState((prevState) => Object.assign({}, prevState, { submitting }));
// 	};

// 	componentDidMount() {
// 		this.props.dispatch(loadAuditApplyForm(this.props.params.auditId));
// 	}

// 	dateChanged = (date) => {
// 		if( typeof date !== "string"){
// 			this.setState({
// 				audit_date: date
// 			});
// 		}
// 	};

// 	onSubmit = (e) => {
// 		e.preventDefault();
// 		this.setSubmitting(true);
// 		this.props.dispatch(submitAuditApplyForm({
// 			audit_id: this.props.audit.id,
// 			audit_date: this.state.audit_date ? this.state.audit_date.format("YYYY-MM-DD") : "",
// 		})).done(() => {
// 			hashHistory.push(`/audit/cycle/${this.props.audit.audit_cycle.id}`);
// 			window.location.reload();
// 		}).always(() => this.setSubmitting(false));
// 	};

// 	isValidDate = (currentDate) => {
// 		const sDate= new Date();
// 		let hours = sDate.getHours();
// 		let minutes = sDate.getMinutes();
// 		let seconds = sDate.getSeconds();
// 		let current_time = hours + ":" + minutes + ":" + seconds;
// 		if (current_time>"12:00:00"){
// 			sDate.setDate(sDate.getDate());
// 		}
// 		else{
// 			sDate.setDate(sDate.getDate()-1);
// 		}
// 		const SevenDaysLaterDate=new Date();
// 		SevenDaysLaterDate.setDate(sDate.getDate() + 7);
// 		let eDate;
// 		if (SevenDaysLaterDate>new Date(this.props.audit.audit_cycle.end_date)){
// 			eDate=new Date(this.props.audit.audit_cycle.end_date);
// 		}
// 		else{
// 			eDate=SevenDaysLaterDate;
// 		}
// 		return currentDate.isBetween(sDate, eDate, null, "[]"); //inclusive
// 	};

// 	render() {
// 		const sDate= new Date();
// 		let hours = sDate.getHours();
// 		let minutes = sDate.getMinutes();
// 		let seconds = sDate.getSeconds();
// 		let current_time = hours + ":" + minutes + ":" + seconds;
// 		if (current_time>"12:00:00"){
// 			sDate.setDate(sDate.getDate()+1);
// 		}
// 		else{
// 			sDate.setDate(sDate.getDate());
// 		}
// 		const SevenDaysLaterDate=new Date();
// 		SevenDaysLaterDate.setDate(sDate.getDate() + 6);
// 		let eDate;
// 		if (SevenDaysLaterDate>new Date(this.props.audit.audit_cycle.end_date)){
// 			eDate=new Date(this.props.audit.audit_cycle.end_date);
// 		}
// 		else{
// 			eDate=SevenDaysLaterDate;
// 		}
// 		return (
// 			<Modal modalTitle={`Please select your preferable date for the ${this.props.audit.store.city.name} audit:`} onClose={hashHistory.goBack}>
// 				<form onSubmit={this.onSubmit}>
// 					<FormErrorList errors={this.props.errors.non_field_errors}/>
// 					<p className="text-center">
// 						<big>{ moment(sDate).format(momentDateFormat) }</big> to <big>{ moment(eDate).format(momentDateFormat) }</big>
// 					</p>
// 					<style dangerouslySetInnerHTML={{__html:".rdtPicker{ margin-left:auto; margin-right:auto; }"}}/>
// 					<Datetime style={{marginLeft:"auto",marginRight:"auto"}}
// 						timeFormat={false} dateFormat="YYYY-MM-DD"
// 						closeOnSelect={false} closeOnTab={false} disableOnClickOutside={true}
// 						open={true} input={false}
// 						name="audit_date"
// 						value={this.state.audit_date}
// 						onChange={this.dateChanged}
// 						isValidDate={this.isValidDate}
// 					/>
// 					<FormErrorList errors={this.props.errors.audit_date}/>
// 					<button className="btn btn-lg btn-primary btn-block" disabled={!this.state.audit_date || this.state.submitting}>
// 						{ this.state.submitting ? "applying..." :
// 							<span>Apply{ this.state.audit_date ? <span> for <b>{this.state.audit_date.format(momentDateFormat)}</b></span> : null }</span> }
// 					</button>
// 				</form>
// 			</Modal>
// 		);
// 	}
// }

// var mapStoreToProps = function(store, ownProps){
// 	return {
// 		audit: store.audits[ownProps.params.auditId] || store.travel_audits[ownProps.params.auditId],
// 		errors: store.forms.auditApply.errors || {},
// 	};
// };

// export default ReactRedux.connect( mapStoreToProps)(AuditApplyForm);

import React from "react";
import PropTypes from "prop-types";
import * as ReactRedux from "react-redux";
import { hashHistory } from "react-router";

import Datetime from "react-datetime";
import "react-datetime/css/react-datetime.css";

import moment from "moment";

import { momentDateFormat } from "../../../config.js";

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
		if (typeof date !== "string") {
			this.setState({
				audit_date: date,
			});
		}
	};

	onSubmit = (e) => {
		e.preventDefault();
		this.setSubmitting(true);
		this.props.dispatch(
			submitAuditApplyForm({
				audit_id: this.props.audit.id,
				audit_date: this.state.audit_date
					? this.state.audit_date.format("YYYY-MM-DD")
					: "",
			})
		)
			.done(() => {
				hashHistory.push(`/audit/cycle/${this.props.audit.audit_cycle.id}`);
				window.location.reload();
			})
			.always(() => this.setSubmitting(false));
	};

	isValidDate = (currentDate) => {
		const current = new Date();
		current.setDate(current.getDate() + 1); // Set to tomorrow
		const auditStartDate = new Date(this.props.audit.audit_cycle.start_date);
		const auditEndDate = new Date(this.props.audit.audit_cycle.end_date);

		//----Normalizing dates to midnight to avoid time-of-day issues-------
		current.setHours(0, 0, 0, 0);
		auditStartDate.setHours(0, 0, 0, 0);
		auditEndDate.setHours(0, 0, 0, 0);

		//----Use audit_cycle.start_date if it's in the future, otherwise use current date----
		const effectiveStartDate =
			auditStartDate > current ? auditStartDate : current;

		//-----Calculate 7 days from effectiveStartDate-----
		const SevenDaysLaterDate = new Date(effectiveStartDate);
		SevenDaysLaterDate.setDate(effectiveStartDate.getDate() + 6);

		//----End date is the earlier of SevenDaysLaterDate or audit_cycle.end_date----
		const eDate =
			SevenDaysLaterDate > auditEndDate ? auditEndDate : SevenDaysLaterDate;

		const momentCurrent = moment(currentDate).startOf("day");
		const momentStart = moment(effectiveStartDate).startOf("day");
		const momentEnd = moment(eDate).startOf("day");

		return momentCurrent.isBetween(momentStart, momentEnd, null, "[]");
	};

	render() {
		const current = new Date();
		current.setDate(current.getDate() + 1); // Set to tomorrow
		const auditStartDate = new Date(this.props.audit.audit_cycle.start_date);
		const auditEndDate = new Date(this.props.audit.audit_cycle.end_date);

		//----Normalizing dates to midnight----
		current.setHours(0, 0, 0, 0);
		auditStartDate.setHours(0, 0, 0, 0);
		auditEndDate.setHours(0, 0, 0, 0);

		//-----Use audit_cycle.start_date if it's in the future, otherwise use current date---------
		const effectiveStartDate =
			auditStartDate > current ? auditStartDate : current;

		//-------Calculate 7 days from effectiveStartDate-------
		const SevenDaysLaterDate = new Date(effectiveStartDate);
		SevenDaysLaterDate.setDate(effectiveStartDate.getDate() + 6); // +6 for display 7day range including

		//----End date is the earlier of SevenDaysLaterDate or audit_cycle.end_date----
		const eDate =
			SevenDaysLaterDate > auditEndDate ? auditEndDate : SevenDaysLaterDate;

		return (
			<Modal modalTitle={`Please select your preferable date for the ${this.props.audit.store.city.name} audit:`} onClose={hashHistory.goBack} >
				<form onSubmit={this.onSubmit}>
					<FormErrorList errors={this.props.errors.non_field_errors} />
					<p className="text-center">
						<big>{moment(effectiveStartDate).format(momentDateFormat)}</big> to{" "}
						<big>{moment(eDate).format(momentDateFormat)}</big>
					</p>
					<style
						dangerouslySetInnerHTML={{
							__html: ".rdtPicker{ margin-left:auto; margin-right:auto; }",
						}}
					/>
					<Datetime
						style={{ marginLeft: "auto", marginRight: "auto" }}
						timeFormat={false}
						dateFormat="YYYY-MM-DD"
						closeOnSelect={false}
						closeOnTab={false}
						disableOnClickOutside={true}
						open={true}
						input={false}
						name="audit_date"
						value={this.state.audit_date}
						onChange={this.dateChanged}
						isValidDate={this.isValidDate}
					/>
					<FormErrorList errors={this.props.errors.audit_date} />
					<button
						className="btn btn-lg btn-primary btn-block"
						disabled={!this.state.audit_date || this.state.submitting}
					>
						{this.state.submitting ? (
							"applying..."
						) : (
							<span>
								Apply
								{this.state.audit_date ? (
									<span>
										{" "}
										for <b>{this.state.audit_date.format(momentDateFormat)}</b>
									</span>
								) : null}
							</span>
						)}
					</button>
				</form>
			</Modal>
		);
	}
}

const mapStoreToProps = function (store, ownProps) {
	return {
		audit: store.audits[ownProps.params.auditId] || store.travel_audits[ownProps.params.auditId],
		errors: store.forms.auditApply.errors || {},
	};
};

export default ReactRedux.connect(mapStoreToProps)(AuditApplyForm);