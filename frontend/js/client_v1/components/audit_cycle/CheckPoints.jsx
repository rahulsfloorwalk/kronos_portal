import React from "react";
import PropTypes from "prop-types";
import * as ReactRedux from "react-redux";
import { hashHistory } from "react-router";

import Alert from "react-s-alert";

import { fetchAuditCycle, setCheckPoints } from "../../actions/audit.js";

import { affectInputEventToComponent } from "../../../react_utils.js";
import FormTextarea from "../../../components/FormTextarea.jsx";
import SaveButton from "../../../components/SaveButton.jsx";
import Modal from "../../../components/Modal.jsx";
import MarkdownViewer from "../../../components/MarkdownViewer.jsx";

class CheckPoints extends React.Component{
	static propTypes = {
		dispatch: PropTypes.func.isRequired,
		params: PropTypes.shape({
			auditCycleId: PropTypes.string.isRequired,
		}),
		auditCycle: PropTypes.shape({
			check_points: PropTypes.string,
		}),
		errors: PropTypes.shape({
			check_points: PropTypes.string,
		}),
	};

	constructor(props){
		super(props);
		this.state = {
			check_points: null,
			errMsg: ""
		};
	}

	componentDidMount() {
		this.props.dispatch(fetchAuditCycle(this.props.params.auditCycleId));

		if(this.props.auditCycle){
			this.setState({
				check_points: this.props.auditCycle.check_points
			});
		}
	}

	componentWillReceiveProps(nextProps){
		if(nextProps.auditCycle){
			this.setState({
				check_points: nextProps.auditCycle.check_points
			});
		}
	}

	fieldChanged = (e) => {
		affectInputEventToComponent(e, this);
	};

	onSubmit = (e) => {
		e.preventDefault();
		var promise = this.props.dispatch(setCheckPoints(this.props.params.auditCycleId, this.state.check_points));
		promise.then((AuditCycle) => {
			hashHistory.push(`/audit_cycle/${AuditCycle.id}/questionnaire`);
			Alert.success("CheckPoints Saved");
		},(err) => {
			this.setState({
				errMsg : err.responseJSON.non_field_errors[0],
			});
		});

	};

	render(){
		var span_style = {
			color:"red",
			padding:"2px"
		};
		return (
			<Modal modalTitle={"CheckPoints"} onClose={hashHistory.goBack}>
				<form onSubmit={this.onSubmit}>
					<span style={span_style}><b>{this.state.errMsg}</b></span>
					<FormTextarea label="CheckPoints (markdown)" name="check_points" onChange={this.fieldChanged} value={this.state.check_points} errors={this.props.errors.check_points}/>
					<div>
						<label>Preview:</label>
						<MarkdownViewer markdown={this.state.check_points}/>
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

export default ReactRedux.connect( mapStoreToProps)(CheckPoints);
