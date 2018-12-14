import React from "react";
import PropTypes from "prop-types";
import * as ReactRedux from "react-redux";
import { hashHistory } from "react-router";

import Alert from "react-s-alert";

import { loadSectionAddForm, loadSectionEditForm, saveSectionEditForm, saveSectionAddForm } from "../../actions/section.js";

import { affectInputEventToComponent } from "../../../react_utils.js";
import FormInput from "../../../components/FormInput.jsx";
import SaveButton from "../../../components/SaveButton.jsx";
import Modal from "../../../components/Modal.jsx";

class SectionForm extends React.Component {
	static propTypes = {
		params: PropTypes.shape({
			sectionId: PropTypes.number,
			auditCycleId: PropTypes.number.isRequired,
		}),
		location: PropTypes.shape({
			pathname: PropTypes.string.isRequired,
		}).isRequired,
		section: PropTypes.shape({
			id: PropTypes.number,
			audit_cycle_id: PropTypes.number,
			name: PropTypes.number,
			sequence: PropTypes.number,
			minimum_attachment_count: PropTypes.number,
		}),
		errors: PropTypes.object,
		dispatch: PropTypes.func.isRequired,
	};

	state = {};

	componentDidMount() {
		if(this.props.params.sectionId){
			this.props.dispatch(loadSectionEditForm(this.props.params.sectionId));
		} else {
			this.props.dispatch(loadSectionAddForm());
		}
		this.setState({
			audit_cycle: this.props.params.auditCycleId
		});
	}

	componentWillReceiveProps(nextProps) {
		if( nextProps.section){
			this.setState(nextProps.section);
		}
		this.setState({
			audit_cycle: nextProps.params.auditCycleId
		});
	}

	inputChanged = (e) => {
		affectInputEventToComponent(e, this);
	};

	onSubmit = (e) => {
		e.preventDefault();
		var submitPromise;
		if(this.props.params.sectionId){
			submitPromise = this.props.dispatch(saveSectionEditForm(this.state));
		} else {
			submitPromise = this.props.dispatch(saveSectionAddForm(this.state));
		}
		submitPromise.then(() => {
			hashHistory.push(`/audit_cycle/${this.props.params.auditCycleId}/questionnaire`);
			Alert.success("SECTION SAVED");
		});
	};

	saveAndNext = (e) => {
		e.preventDefault();
		let submitPromise;
		if(this.props.params.sectionId){
			submitPromise = this.props.dispatch(saveSectionEditForm(this.state));
		} else {
			submitPromise = this.props.dispatch(saveSectionAddForm(this.state));
		}
		submitPromise.then((savedSection) => {
			this.setState({
				sequence: savedSection.sequence + 1,
				name: "",
			});
			hashHistory.push(this.props.location.pathname);
			Alert.success("SECTION SAVED");
			this._nameInput && this._nameInput.focus();
		});
	};

	render() {
		const modalTitle = this.props.params.auditCycleId ? "Edit Section" : "Add Section";
		return (
			<Modal modalTitle={modalTitle} onClose={hashHistory.goBack}>
				<form onSubmit={this.onSubmit}>
					<FormInput label="Sequence" min="1" type="number" value={this.state.sequence} name="sequence" onChange={this.inputChanged} errors={this.props.errors.sequence}/>
					<FormInput label="Section Name" maxLength="50" type="text" value={this.state.name} name="name" onChange={this.inputChanged} errors={this.props.errors.name} ref={r => this._nameInput = r}/>
					<FormInput label="Minimum Attachments" type="number" value={this.state.minimum_attachment_count} name="minimum_attachment_count" onChange={this.inputChanged} errors={this.props.errors.minimum_attachment_count}/>
					<SaveButton/>&nbsp;
					{ ! this.props.params.sectionId ?
						<button type="button" className="btn btn-primary" onClick={this.saveAndNext}>Save and Next</button>
						: null }
				</form>
			</Modal>
		);
	}
}

const mapStoreToProps = (store, ownProps) => {
	return {
		section: store.sections[ownProps.params.sectionId],
		errors: store.forms.section.errors,
	};
};

export default ReactRedux.connect( mapStoreToProps)(SectionForm);
