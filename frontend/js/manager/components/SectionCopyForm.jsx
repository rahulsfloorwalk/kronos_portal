import React from 'react';
import * as ReactRedux from 'react-redux';
import { hashHistory } from 'react-router';

import { fetchAuditCycles } from '../actions/audit.js';

import { copySectionsFromTo } from '../service/section.js';

import { affectInputEventToComponent } from '../../react_utils.js';
import FormSelect from '../../components/FormSelect.jsx';
import FormGroup from '../../components/FormGroup.jsx';
import SaveButton from '../../components/SaveButton.jsx';
import Modal from '../../components/Modal.jsx';
import { Duplicate } from '../../components/Icons.jsx';

var SectionCopyForm = React.createClass({
	getInitialState: function(){
		return {
			selectedAuditCycleId: null
		};
	},
	componentDidMount: function() {
		if(this.props.auditCycle){
			this.props.dispatch(fetchAuditCycles(this.props.auditCycle.client.id));
		}
	},
	inputChanged: function(e){
		affectInputEventToComponent(e, this);
	},
	onSubmit: function(e){
		e.preventDefault();
		copySectionsFromTo(this.state.selectedAuditCycleId, this.props.params.auditCycleId).then((sections) => {
			hashHistory.push(`/audit_cycle/${this.props.params.auditCycleId}/questionnaire`);
		});
	},
	render : function(){
		console.log("otherAuditCycles", this.props);
		let auditCycleOptions = [];
		for( let ac of this.props.otherAuditCycles){
			auditCycleOptions.push(<option key={ac.id} value={ac.id}>{ac.name}</option>);
		}
		return (
			<Modal modalTitle="Copy Sections" onClose={hashHistory.goBack}>
				<form onSubmit={this.onSubmit}>
					<FormSelect label="Audit Cycle" value={this.state.selectedAuditCycleId} name="selectedAuditCycleId" onChange={this.inputChanged}>
						<option value="">Select Audit Cycle</option>
						{auditCycleOptions}
					</FormSelect>
					<button className="btn btn-primary btn-lg">
						<Duplicate/> Copy
					</button>
				</form>
			</Modal>
		);
	},
});

var mapStoreToProps = function(store, ownProps){
	return {
		auditCycle: store.auditCycles[ownProps.params.auditCycleId],
		otherAuditCycles: (function(auditCycles){
			let selectedCycles = [];
			for( let id in auditCycles){
				console.log("auditCycles[id].id",auditCycles[id].id);
				console.log("ownProps.params.auditCycleId", parseInt(ownProps.params.auditCycleId));
				if( auditCycles[id].id !== parseInt(ownProps.params.auditCycleId)){
					selectedCycles.push(auditCycles[id]);
				}
			}
			return selectedCycles;
		}(store.auditCycles))
	};
};

export default ReactRedux.connect( mapStoreToProps)(SectionCopyForm);
