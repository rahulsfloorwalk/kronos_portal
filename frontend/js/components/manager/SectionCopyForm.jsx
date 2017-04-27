import React from 'react';
import * as ReactRedux from 'react-redux';
import { hashHistory } from 'react-router';

import { fetchAuditCycles } from '../../manager/actions/audit.js';

import { copySectionsFromTo } from '../../manager/service/section.js';

import { affectInputEventToComponent } from '../../react_utils.js';
import FormSelect from '../FormSelect.jsx';
import FormGroup from '../FormGroup.jsx';
import SaveButton from '../SaveButton.jsx';
import Modal from '../Modal.jsx';
import { Duplicate } from '../Icons.jsx';

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
		console.debug("otherAuditCycles", this.props);
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
				console.debug("auditCycles[id].id",auditCycles[id].id);
				console.debug("ownProps.params.auditCycleId", parseInt(ownProps.params.auditCycleId));
				if( auditCycles[id].id !== parseInt(ownProps.params.auditCycleId)){
					selectedCycles.push(auditCycles[id]);
				}
			}
			return selectedCycles;
		}(store.auditCycles))
	};
};

export default ReactRedux.connect( mapStoreToProps)(SectionCopyForm);
