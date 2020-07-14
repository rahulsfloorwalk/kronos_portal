import React from "react";
import PropTypes from "prop-types";
import * as ReactRedux from "react-redux";
import { hashHistory } from "react-router";

import moment from "moment";
import { momentDateFormat }  from "../../../config.js";

import { fiatAssignAudit } from "../service/application.js";

import { findAuditById } from "../selectors/audit";

import { affectInputEventToComponent } from "../../react_utils.js";
import FormErrorList from "../../components/FormErrorList.jsx";
import { FormDateInput } from "../../components/FormInput.jsx";
import FormInput from "../../components/FormInput.jsx";
import SaveButton from "../../components/SaveButton.jsx";
import Modal from "../../components/Modal.jsx";
import Loading from "../../components/Loading.jsx";

import { auditPropType } from "../prop_types";

class AuditFiatAssignForm extends React.Component {
	static propTypes = {
		params: PropTypes.shape({
			auditCycleId: PropTypes.string.isRequired,
			auditId: PropTypes.string.isRequired,
		}),
		location: PropTypes.shape({
			query: PropTypes.shape({
				email: PropTypes.string,
			}),
		}),
		auditCycle: PropTypes.shape({
			id: PropTypes.number.isRequired,
			start_date: PropTypes.string.isRequired,
			end_date: PropTypes.string.isRequired,
		}),
		audit: auditPropType,
	};

	state = {
		errors: {},
		loading: false,
	};

	componentDidMount() {
		if(this.props.audit){
			this.setState({
				"audit": this.props.audit.id,
				"earnings_per_audit": this.props.audit.earnings_per_audit,
				"reimbursement": this.props.audit.reimbursement,
				"audit_count": 1
			});
		}
		if(this.props.location && this.props.location.query && this.props.location.query.email) {
			this.setState({
				"email": this.props.location.query.email,
			});
		}
	}

	componentWillReceiveProps(nextProps) {
		if(nextProps.audit && nextProps.audit !== this.props.audit){
			this.setState({
				"audit": nextProps.audit.id,
				"earnings_per_audit": nextProps.audit.earnings_per_audit,
				"reimbursement": nextProps.audit.reimbursement,
			});
		}
	}

	setLoading = (loading) => this.setState((prevState) => Object.assign({}, prevState, { loading }));

	dateChanged = (date) => {
		if( typeof date !== "string"){
			this.setState({
				audit_date: date.format("YYYY-MM-DD")
			});
		}
	};

	inputChanged = (e) => {
		affectInputEventToComponent(e, this);
	};

	onSubmit = (e) => {
		this.setLoading(true);
		e.preventDefault();
		var promise = fiatAssignAudit(this.props.params.auditId, this.state.email, this.state.audit_date, this.state.earnings_per_audit, this.state.reimbursement, this.state.audit_count);
		promise.done(() => {
			hashHistory.push(`/audit_cycle/${this.props.params.auditCycleId}/audit`);
			this.setLoading(false);
		}
		);
		promise.fail((error) => this.setState({errors: error.responseJSON || {}}));
	};

	render() {
		if( ! this.props.audit){
			return <Loading/>;
		}
		var audit_details = this.props.audit;
		var audit_count = audit_details.count - audit_details.report_count;
		let audit_select_option = [];
		if (audit_count === 0){
			audit_select_option.push(<option key="1" value="1">1</option>);
		}
		else{
			for(var i=1;i<=audit_count;i++){
				audit_select_option.push(<option key={i} value={i}>{i}</option>);
			}
		}
		let audit_select = (
			<select className="form-control"
				name="audit_count"
				value={this.state.audit_count}
				onChange={(e) => this.setState({"audit_count": e.target.value})}>
				{audit_select_option}
			</select>
		);
		let saveButton = (<SaveButton text="Approve"/>);
		if (this.state.loading){
			saveButton = <Loading/>;
		}
		return (
			<Modal modalTitle="Assign Application" onClose={hashHistory.goBack}>
				<form onSubmit={this.onSubmit}>
					<FormErrorList errors={this.state.errors.non_field_errors}/>
					<p>Store: <b>{this.props.audit.store.name}, {this.props.audit.store.city.name}</b></p>
					<p>Audit Cycle Dates: <b>{moment(this.props.auditCycle.start_date).format(momentDateFormat)}</b> to <b>{moment(this.props.auditCycle.end_date).format(momentDateFormat)}</b></p>
					<FormInput label="User Email" value={this.state.email} name="email" onChange={this.inputChanged} errors={this.state.errors.email}/>
					<FormDateInput label="Audit Date" value={this.state.audit_date} name="audit_date" onChange={this.dateChanged} errors={this.state.errors.audit_date}/>
					<p>
						<label>Asigned Audit Count</label>
						{audit_select}
					</p>
					<FormInput
						label="Audit Fees"
						type="number"
						value={this.state.earnings_per_audit}
						name="earnings_per_audit"
						onChange={(e) => this.setState({"earnings_per_audit": e.target.value})}
						errors={this.state.errors.earnings_per_audit}/>
					<FormInput
						label="Reimbursement"
						value={this.state.reimbursement}
						name="reimbursement"
						onChange={(e) => this.setState({"reimbursement": e.target.value})}
						errors={this.state.errors.reimbursement}/>
					{saveButton}
				</form>
			</Modal>
		);
	}
}

const mapStoreToProps = (store, ownProps) => {
	const auditId = parseInt(ownProps.params.auditId);
	return {
		auditCycle: store.auditCycles[ownProps.params.auditCycleId],
		audit: findAuditById(store, auditId),
	};
};

export default ReactRedux.connect( mapStoreToProps)(AuditFiatAssignForm);
