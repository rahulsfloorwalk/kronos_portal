import React from 'react';
import $ from 'jquery';
import * as ReactRedux from 'react-redux';
import { hashHistory } from 'react-router';

import Alert from 'react-s-alert';

import { loadSectionAddForm, loadSectionEditForm, saveSectionEditForm, saveSectionAddForm } from '../../manager/actions/section.js';

import { affectInputEventToComponent } from '../../react_utils.js';
import FormInput from '../FormInput.jsx';
import FormGroup from '../FormGroup.jsx';
import SaveButton from '../SaveButton.jsx';
import Modal from '../Modal.jsx';

var SectionForm = React.createClass({
	getInitialState: function(){
		return {};
	},
	componentDidMount: function() {
		//console.log("componentDidMount(...) called with props.params as", this.props.params);
		if(this.props.params.sectionId){
			this.props.dispatch(loadSectionEditForm(this.props.params.sectionId));
		} else {
			this.props.dispatch(loadSectionAddForm());
		}
		this.setState({
			audit_cycle: this.props.params.auditCycleId
		});
	},
	componentWillReceiveProps: function(nextProps) {
		//console.log("componentWillReceiveProps(...) called with",nextProps);
		if( nextProps.section){
			this.setState(nextProps.section);
		}
		this.setState({
			audit_cycle: nextProps.params.auditCycleId
		});
	},
	inputChanged: function(e){
		affectInputEventToComponent(e, this);
	},
	onSubmit: function(e){
		e.preventDefault();
		var submitPromise;
		if(this.props.params.sectionId){
			submitPromise = this.props.dispatch(saveSectionEditForm(this.state));
		} else {
			submitPromise = this.props.dispatch(saveSectionAddForm(this.state));
		}
		submitPromise.then( savedClient => {
			hashHistory.push(`/audit_cycle/${this.props.params.auditCycleId}/questionnaire`);
			Alert.success("SECTION SAVED");
		});
	},
	saveAndNext: function(e){
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
	},
	render : function(){
		var modalTitle = this.props.params.auditCycleId ? "Edit Section" : "Add Section";
		return (
			<Modal modalTitle={modalTitle} onClose={hashHistory.goBack}>
				<form onSubmit={this.onSubmit}>
					<FormInput label="Sequence" min="1" type="number" value={this.state.sequence} name="sequence" onChange={this.inputChanged} errors={this.props.errors.sequence}/>
					<FormInput label="Section Name" maxLength="50" type="text" value={this.state.name} name="name" onChange={this.inputChanged} errors={this.props.errors.name} ref={r => this._nameInput = r}/>
					<SaveButton/>&nbsp;
					{ ! this.props.params.sectionId ?
					<button type="button" className="btn btn-primary" onClick={this.saveAndNext}>Save and Next</button>
					: null }
				</form>
			</Modal>
		);
	},
});

var mapStoreToProps = function(store, ownProps){
	//console.debug("ownProps",ownProps);
	return {
		section: store.sections[ownProps.params.sectionId],
		errors: store.forms.section.errors,
	};
};

export default ReactRedux.connect( mapStoreToProps)(SectionForm);
