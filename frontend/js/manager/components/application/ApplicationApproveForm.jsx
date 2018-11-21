import React from "react";
import PropTypes from "prop-types";
import $ from "jquery";
import * as ReactRedux from "react-redux";

import Alert from "react-s-alert";

import { submitApplicationApproveForm } from "../../actions/application.js";
import { findById } from "../../service/application.js";

import { findAuditById } from "../../selectors/audit";

import { getAuditType, getAuditStatus } from "../../../utils.js";
import { affectInputEventToComponent } from "../../../react_utils.js";
import FormErrorList from "../../../components/FormErrorList.jsx";
import { FormDateInput } from "../../../components/FormInput.jsx";
import FormInput from "../../../components/FormInput.jsx";
import FormSelect from "../../../components/FormSelect.jsx";
import FormGroup from "../../../components/FormGroup.jsx";
import FormTextarea from "../../../components/FormTextarea.jsx";
import SaveButton from "../../../components/SaveButton.jsx";
import Modal from "../../../components/Modal.jsx";
import Loading from "../../../components/Loading.jsx";

class ApplicationApproveForm extends React.Component {
	static contextTypes = {
		auditCycleId: React.PropTypes.number,
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
    };

    componentDidMount() {
    	findById(this.props.params.applicationId).then(application => {
    		this.setState({
    			application,
    			"audit_date": application.audit_date
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

    dateChanged = (date) => {
    	if( typeof date !== "string"){
    		this.setState({
    			audit_date: date.format("YYYY-MM-DD")
    		});
    	}
    };

	onSubmit = (e) => {
		e.preventDefault();
		const obj = {
			application_id: this.state.application.id,
			audit_date: this.state.audit_date,
			earnings_per_audit: this.state.earnings_per_audit,
			reimbursement: this.state.reimbursement,
		};
		const promise = this.props.dispatch(submitApplicationApproveForm(obj));
		promise.then(() => {
			this.props.router.push({
				pathname: `/audit_cycle/${this.context.auditCycleId}/audit`,
				state: { t: Date.now() },
			});
			Alert.success("APPLICATION APPROVED");
		}, (err) => {
			this.setState({ errors: err && err.responseJSON });
		});
	};

    render() {
    	if( ! this.state.application){
    		return <Loading/>;
    	}
    	return (
    		<Modal modalTitle="Approve Application" onClose={this.props.router.goBack}>
    			<form onSubmit={this.onSubmit}>
    				<FormErrorList errors={this.state.errors.non_field_errors}/>
    				<p><label>Auditor Name:</label> { this.state.application.profileinfo.first_name } {this.state.application.profileinfo.last_name}</p>
    				<FormDateInput label="Approved Audit Date" value={this.state.audit_date} name="audit_date" onChange={this.dateChanged} errors={this.state.errors.audit_date}/>
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
    				<SaveButton text="Approve"/>
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
