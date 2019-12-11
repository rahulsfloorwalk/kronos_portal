import React from "react";
import PropTypes from "prop-types";
import * as ReactRedux from "react-redux";
import { hashHistory } from "react-router";

import { fetchAuditCycle, setCheckPoints } from "../actions/audit.js";

import { affectInputEventToComponent } from "../../react_utils.js";
import FormTextarea from "../../components/FormTextarea.jsx";
import SaveButton from "../../components/SaveButton.jsx";
import Modal from "../../components/Modal.jsx";
import MarkdownViewer from "../../components/MarkdownViewer.jsx";

class PostApprovalDescriptionForm extends React.Component{
	static propTypes = {
		dispatch: PropTypes.func.isRequired,
		params: PropTypes.shape({
			auditCycleId: PropTypes.string.isRequired,
		}),
		auditCycle: PropTypes.shape({
			checkpoints: PropTypes.string,
		}),
		errors: PropTypes.shape({
			checkpoints: PropTypes.string,
		}),
	};

	constructor(props){
		super(props);
		this.state = {
			checkpoints: null
		};
	}

	componentDidMount() {
		this.props.dispatch(fetchAuditCycle(this.props.params.auditCycleId));

		if(this.props.auditCycle){
			this.setState({
				checkpoints: ""
			});
		}
	}

	componentWillReceiveProps(nextProps){
		if(nextProps.auditCycle){
			this.setState({
				checkpoints: ""
			});
		}
	}

    fieldChanged = (e) => {
		affectInputEventToComponent(e, this);
	};

	onSubmit = (e) => {
		e.preventDefault();
		this.props.dispatch(setCheckPoints(this.props.params.auditCycleId, this.state.checkpoints)).then((AuditCycle) => {
			hashHistory.push(`/audit_cycle/${AuditCycle.id}/questionnaire`);
		});
	};

	render(){
		return (
			<Modal modalTitle={"CheckPoints"} onClose={hashHistory.goBack}>
				<form onSubmit={this.onSubmit}>
					<FormTextarea label="CheckPoints (markdown)" name="checkpoints" onChange={this.fieldChanged} value={this.state.checkpoints} errors={this.props.errors.checkpoints}/>
					<div>
						<label>Preview:</label>
						<MarkdownViewer markdown={this.state.checkpoints}/>
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

export default ReactRedux.connect( mapStoreToProps)(PostApprovalDescriptionForm);
