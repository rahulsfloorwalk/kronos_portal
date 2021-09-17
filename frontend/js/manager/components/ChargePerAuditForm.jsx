import React from "react";
import PropTypes from "prop-types";
import * as ReactRedux from "react-redux";
import { hashHistory } from "react-router";
import Alert from "react-s-alert";

import { fetchAuditCycle, setChargePerAudit } from "../actions/audit.js";

import { affectInputEventToComponent } from "../../react_utils.js";
import FormInput from "../../components/FormInput.jsx";
import SaveButton from "../../components/SaveButton.jsx";
import Modal from "../../components/Modal.jsx";

class ChargePerAuditForm extends React.Component{
	static propTypes = {
		dispatch: PropTypes.func.isRequired,
		params: PropTypes.shape({
			auditCycleId: PropTypes.string.isRequired,
		}),
		auditCycle: PropTypes.shape({
			charge_per_audit: PropTypes.number,
		}),
		errors: PropTypes.shape({
			charge_per_audit: PropTypes.string,
		}),
	};

	constructor(props){
		super(props);
		this.state = {
			charge_per_audit: "",
			errMsg: ""
		};
	}

	componentDidMount() {
		this.props.dispatch(fetchAuditCycle(this.props.params.auditCycleId));

		if(this.props.auditCycle){
			this.setState({
				charge_per_audit: this.props.auditCycle.charge_per_audit
			});
		}
	}

	componentWillReceiveProps(nextProps){
		if(nextProps.auditCycle){
			this.setState({
				charge_per_audit: nextProps.auditCycle.charge_per_audit
			});
		}
	}

	fieldChanged = (e) => {
		affectInputEventToComponent(e, this);
	};

	onSubmit = (e) => {
		e.preventDefault();
		this.props.dispatch(setChargePerAudit(this.props.params.auditCycleId, this.state.charge_per_audit)).then((savedAuditCycle) => {
			hashHistory.push(`/audit_cycle/${savedAuditCycle.id}/questionnaire`);
			Alert.success("Charge Per Audit Saved");
		},(err) => {
			this.setState({
				errMsg : err.responseJSON.charge_per_audit,
			});
		});
	};

	render(){
		return (
			<Modal modalTitle={"Charge per audit"} onClose={hashHistory.goBack}>
				<form onSubmit={this.onSubmit}>
					<p className="text-danger"><b>{this.state.errMsg}</b></p>
					<FormInput label="Enter charge per audit" name="charge_per_audit" type="number" value={this.state.charge_per_audit} onChange={this.fieldChanged} errors={this.props.errors.charge_per_audit}/>
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

export default ReactRedux.connect( mapStoreToProps)(ChargePerAuditForm);
