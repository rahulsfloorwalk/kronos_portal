import React from "react";
import PropTypes from "prop-types";
import * as ReactRedux from "react-redux";

import Alert from "react-s-alert";

import { loadSectionAddForm, saveSectionAddForm } from "../../actions/section.js";

import { affectInputEventToComponent } from "../../../react_utils.js";
import FormInput from "../../../components/FormInput.jsx";
import SaveButton from "../../../components/SaveButton.jsx";
import Modal from "../../../components/Modal.jsx";

export class SectionAddForm extends React.Component {
	static propTypes = {
		auditCycleId: PropTypes.number.isRequired,

		location: PropTypes.shape({
			pathname: PropTypes.string.isRequired,
		}).isRequired,
		router: PropTypes.shape({
			push: PropTypes.func.isRequired,
			goBack: PropTypes.func.isRequired,
		}).isRequired,

		errors: PropTypes.object,

		loadSectionAddForm: PropTypes.func.isRequired,
		saveSectionAddForm: PropTypes.func.isRequired,
	};

	state = {};

	componentDidMount() {
		this.props.loadSectionAddForm();
		this.setState({
			sequence: "",
			name: "",
			minimum_attachment_count: 0,
			audit_cycle: this.props.auditCycleId,
		});
	}

	componentWillReceiveProps(nextProps) {
		this.setState({
			audit_cycle: nextProps.auditCycleId,
		});
	}

	inputChanged = (e) => {
		affectInputEventToComponent(e, this);
	};

	onSubmit = (e) => {
		e.preventDefault();
		this.props.saveSectionAddForm(this.state).then(() => {
			this.props.router.push(`/audit_cycle/${this.props.auditCycleId}/questionnaire`);
			Alert.success("SECTION SAVED");
		});
	};

	saveAndNext = () => {
		this.props.saveSectionAddForm(this.state).then((savedSection) => {
			this.setState({
				sequence: savedSection.sequence + 1,
				name: "",
			});
			this.props.router.push(this.props.location.pathname);
			Alert.success("SECTION SAVED");
			this._nameInput && this._nameInput.focus();
		});
	};

	render() {
		return (
			<Modal modalTitle="Add Section" onClose={this.props.router.goBack}>
				<form onSubmit={this.onSubmit}>
					<FormInput label="Sequence" min="1" type="number" value={this.state.sequence} name="sequence" onChange={this.inputChanged} errors={this.props.errors.sequence}/>
					<FormInput label="Section Name" maxLength="100" type="text" value={this.state.name} name="name" onChange={this.inputChanged} errors={this.props.errors.name} ref={r => this._nameInput = r}/>
					{/* <FormInput label="Minimum Attachments" type="number" value={this.state.minimum_attachment_count} name="minimum_attachment_count" onChange={this.inputChanged} errors={this.props.errors.minimum_attachment_count}/> */}
					<SaveButton/>&nbsp;
					<button type="button" className="btn btn-primary" onClick={this.saveAndNext}>Save and Next</button>
				</form>
			</Modal>
		);
	}
}

const mapStoreToProps = (store, ownProps) => {
	const auditCycleId = parseInt(ownProps.params.auditCycleId);
	return {
		auditCycleId,
		errors: store.forms.errors || {},
	};
};

export default ReactRedux.connect( mapStoreToProps, {
	loadSectionAddForm: loadSectionAddForm,
	saveSectionAddForm: saveSectionAddForm,
})(SectionAddForm);
