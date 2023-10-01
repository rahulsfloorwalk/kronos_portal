import React from "react";
import PropTypes from "prop-types";
import * as ReactRedux from "react-redux";
import { hashHistory } from "react-router";

import { fetchAuditCycle, setEligibilityForAuditors } from "../actions/audit.js";

import { affectInputEventToComponent } from "../../react_utils.js";
import FormTextarea from "../../components/FormTextarea.jsx";
import SaveButton from "../../components/SaveButton.jsx";
import Modal from "../../components/Modal.jsx";
import MarkdownViewer from "../../components/MarkdownViewer.jsx";

class EligibilityForAuditorsForm extends React.Component{
	static propTypes = {
		dispatch: PropTypes.func.isRequired,
		params: PropTypes.shape({
			auditCycleId: PropTypes.string.isRequired,
		}),
		auditCycle: PropTypes.shape({
			eligibility: PropTypes.string,
		}),
		errors: PropTypes.shape({
			eligibility: PropTypes.string,
		}),
	};

	constructor(props){
		super(props);
		this.state = {
			eligibility: null
		};
	}

	componentDidMount() {
		this.props.dispatch(fetchAuditCycle(this.props.params.auditCycleId));

		if(this.props.auditCycle){
			this.setState({
				eligibility: this.props.auditCycle.eligibility
			});
		}
	}

	componentWillReceiveProps(nextProps){
		if(nextProps.auditCycle){
			this.setState({
				eligibility: nextProps.auditCycle.eligibility
			});
		}
	}

	fieldChanged = (e) => {
		affectInputEventToComponent(e, this);
	};

	onSubmit = (e) => {
		e.preventDefault();
		this.props.dispatch(setEligibilityForAuditors(this.props.params.auditCycleId, this.state.eligibility)).then((savedAuditCycle) => {
			hashHistory.push(`/audit_cycle/${savedAuditCycle.id}/questionnaire`);
		});
	};

	render(){
		return (
			<Modal modalTitle={"Eligibility For Auditors"} onClose={hashHistory.goBack}>
				<form onSubmit={this.onSubmit}>
					<FormTextarea label="Eligibility For Auditors" name="eligibility" value={this.state.eligibility} onChange={this.fieldChanged} errors={this.props.errors.eligibility}/>
					<div>
						<label>Preview:</label>
						<MarkdownViewer markdown={this.state.eligibility}/>
					</div>
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

export default ReactRedux.connect( mapStoreToProps)(EligibilityForAuditorsForm);
