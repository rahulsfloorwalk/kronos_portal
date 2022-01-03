import React from "react";
import PropTypes from "prop-types";
import * as ReactRedux from "react-redux";

import Alert from "react-s-alert";

import { loadSectionEditForm, saveSectionEditForm } from "../../actions/section.js";

import { affectInputEventToComponent } from "../../../react_utils.js";
import FormInput from "../../../components/FormInput.jsx";
import SaveButton from "../../../components/SaveButton.jsx";
import Modal from "../../../components/Modal.jsx";
import { findSectionBySectionId } from "../../selectors/section";
import { findFormErrors } from "../../selectors/forms";
import { sectionPropType } from "./prop_types";

export class SectionEditForm extends React.Component {
	static propTypes = {
		sectionId: PropTypes.number.isRequired,
		auditCycleId: PropTypes.number.isRequired,

		location: PropTypes.shape({
			pathname: PropTypes.string.isRequired,
		}).isRequired,
		router: PropTypes.shape({
			push: PropTypes.func.isRequired,
			goBack: PropTypes.func.isRequired,
		}).isRequired,

		section: sectionPropType,
		errors: PropTypes.object,

		loadSectionEditForm: PropTypes.func.isRequired,
		saveSectionEditForm: PropTypes.func.isRequired,
	};

	state = {};

	componentDidMount() {
		this.props.loadSectionEditForm(this.props.sectionId);
		if(this.props.section){
			this.setState(this.props.section);
		}
	}

	componentWillReceiveProps(nextProps) {
		if( nextProps.section !== this.props.section){
			this.setState(nextProps.section);
		}
	}

	inputChanged = (e) => {
		affectInputEventToComponent(e, this);
	};

	onSubmit = (e) => {
		e.preventDefault();
		this.props.saveSectionEditForm(this.state).then(() => {
			this.props.router.push(`/audit_cycle/${this.props.auditCycleId}/questionnaire`);
			Alert.success("SECTION SAVED");
		});
	};

	render() {
		return (
			<Modal modalTitle="Edit Section" onClose={this.props.router.goBack}>
				<form onSubmit={this.onSubmit}>
					<FormInput label="Sequence" min="1" type="number" value={this.state.sequence} name="sequence" onChange={this.inputChanged} errors={this.props.errors.sequence}/>
					<FormInput label="Section Name" maxLength="50" type="text" value={this.state.name} name="name" onChange={this.inputChanged} errors={this.props.errors.name} ref={r => this._nameInput = r}/>
					{/* <FormInput label="Minimum Attachments" type="number" value={this.state.minimum_attachment_count} name="minimum_attachment_count" onChange={this.inputChanged} errors={this.props.errors.minimum_attachment_count}/> */}
					<SaveButton/>&nbsp;
				</form>
			</Modal>
		);
	}
}

const mapStoreToProps = (store, ownProps) => {
	const sectionId = parseInt(ownProps.params.sectionId);
	const auditCycleId = parseInt(ownProps.params.auditCycleId);
	return {
		sectionId,
		auditCycleId,
		section: findSectionBySectionId(store, sectionId),
		errors: findFormErrors(store),
	};
};

export default ReactRedux.connect( mapStoreToProps, {
	loadSectionEditForm: loadSectionEditForm,
	saveSectionEditForm: saveSectionEditForm,
})(SectionEditForm);
