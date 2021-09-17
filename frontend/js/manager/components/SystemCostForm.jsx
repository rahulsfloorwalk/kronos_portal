import React from "react";
import PropTypes from "prop-types";
import * as ReactRedux from "react-redux";
import { hashHistory } from "react-router";
import Alert from "react-s-alert";

import { fetchAuditCycle, setSystemCost } from "../actions/audit.js";

import { affectInputEventToComponent } from "../../react_utils.js";
import FormInput from "../../components/FormInput.jsx";
import SaveButton from "../../components/SaveButton.jsx";
import Modal from "../../components/Modal.jsx";

class SystemCostForm extends React.Component{
	static propTypes = {
		dispatch: PropTypes.func.isRequired,
		params: PropTypes.shape({
			auditCycleId: PropTypes.string.isRequired,
		}),
		auditCycle: PropTypes.shape({
			system_cost: PropTypes.number,
		}),
		errors: PropTypes.shape({
			system_cost: PropTypes.string,
		}),
	};

	constructor(props){
		super(props);
		this.state = {
			system_cost: "",
			errMsg: ""
		};
	}

	componentDidMount() {
		this.props.dispatch(fetchAuditCycle(this.props.params.auditCycleId));

		if(this.props.auditCycle){
			this.setState({
				system_cost: this.props.auditCycle.system_cost
			});
		}
	}

	componentWillReceiveProps(nextProps){
		if(nextProps.auditCycle){
			this.setState({
				system_cost: nextProps.auditCycle.system_cost
			});
		}
	}

	fieldChanged = (e) => {
		affectInputEventToComponent(e, this);
	};

	onSubmit = (e) => {
		e.preventDefault();
		this.props.dispatch(setSystemCost(this.props.params.auditCycleId, this.state.system_cost)).then((savedAuditCycle) => {
			hashHistory.push(`/audit_cycle/${savedAuditCycle.id}/questionnaire`);
			Alert.success("System Cost Saved");
		},(err) => {
			this.setState({
				errMsg : err.responseJSON.system_cost,
			});
		});
	};

	render(){
		return (
			<Modal modalTitle={"System cost"} onClose={hashHistory.goBack}>
				<form onSubmit={this.onSubmit}>
					<p className="text-danger"><b>{this.state.errMsg}</b></p>
					<FormInput label="Enter system cost" name="system_cost" type="number" value={this.state.system_cost} onChange={this.fieldChanged} errors={this.props.errors.system_cost}/>
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

export default ReactRedux.connect( mapStoreToProps)(SystemCostForm);
