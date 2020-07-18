import React from "react";
import PropTypes from "prop-types";
import * as ReactRedux from "react-redux";

import Alert from "react-s-alert";

import { submitApplicationApproveForm } from "../../actions/application.js";
import { findById } from "../../service/application.js";

import { findAuditById } from "../../selectors/audit";

import FormErrorList from "../../../components/FormErrorList.jsx";
import { FormDateInput } from "../../../components/FormInput.jsx";
import FormInput from "../../../components/FormInput.jsx";
import SaveButton from "../../../components/SaveButton.jsx";
import Modal from "../../../components/Modal.jsx";
import Loading from "../../../components/Loading.jsx";
import { auditPropType } from "../../prop_types";

class ApplicationApproveForm extends React.Component {
	static propTypes = {
		params: PropTypes.shape({
			applicationId: PropTypes.string.isRequired,
		}),
		audit: auditPropType,
		dispatch: PropTypes.func.isRequired,
		router: PropTypes.shape({
			push: PropTypes.func,
			goBack: PropTypes.func,
		}),
	};

	static contextTypes = {
		auditCycleId: PropTypes.number,
		audit: PropTypes.shape({
			id: PropTypes.number.isRequired,
			audit_cycle: PropTypes.shape({
				id: PropTypes.number.isRequired,
			}).isRequired,
		}),
	};

	state = {
		application: null,
		errors: {},
		loading: false,
	};

	componentDidMount() {
		findById(this.props.params.applicationId).then(application => {
			this.setState({
				application,
				"audit_date": application.audit_date,
				"audit_count": 1
			});
		});
		if(this.props.audit) {
			this.setState({
				earnings_per_audit: this.props.audit.earnings_per_audit,
				reimbursement: this.props.audit.reimbursement,
			});
		}
	}

	componentWillReceiveProps(nextProps) {
		if(nextProps.audit && nextProps.audit !== this.props.audit) {
			this.setState({
				earnings_per_audit: nextProps.audit.earnings_per_audit,
				reimbursement: nextProps.audit.reimbursement,
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

	onSubmit = (e) => {
		this.setLoading(true);
		e.preventDefault();
		const obj = {
			application_id: this.state.application.id,
			audit_date: this.state.audit_date,
			earnings_per_audit: this.state.earnings_per_audit,
			reimbursement: this.state.reimbursement,
			audit_count: this.state.audit_count
		};
		const promise = this.props.dispatch(submitApplicationApproveForm(obj));
		promise.then(() => {
			this.props.router.push({
				pathname: `/audit_cycle/${this.context.auditCycleId}/audit`,
				state: { t: Date.now() },
			});
			Alert.success("APPLICATION APPROVED");
			this.setLoading(false);
		}, (err) => {
			this.setState({ errors: err && err.responseJSON });
			this.setLoading(false);
		});
	};

	render() {
		if( ! this.state.application){
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
			<Modal modalTitle="Approve Application" onClose={this.props.router.goBack}>
				<form onSubmit={this.onSubmit}>
					<FormErrorList errors={this.state.errors.non_field_errors}/>
					<p><label>Auditor Name:</label> { this.state.application.profileinfo.first_name } {this.state.application.profileinfo.last_name}</p>
					<FormDateInput label="Approved Audit Date" value={this.state.audit_date} name="audit_date" onChange={this.dateChanged} errors={this.state.errors.audit_date}/>
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
		audit: findAuditById(store, auditId),
	};
};

export default ReactRedux.connect(mapStoreToProps)(ApplicationApproveForm);
