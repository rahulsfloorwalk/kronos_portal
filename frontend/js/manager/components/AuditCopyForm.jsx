import React from 'react';
import * as ReactRedux from 'react-redux';
import { hashHistory } from 'react-router';

import Alert from 'react-s-alert';

import { fetchAuditCycles } from '../actions/audit.js';

import { copyAuditsFromTo } from '../service/audit.js';

import { affectInputEventToComponent } from '../../react_utils.js';
import FormSelect from '../../components/FormSelect.jsx';
import FormGroup from '../../components/FormGroup.jsx';
import SaveButton from '../../components/SaveButton.jsx';
import Modal from '../../components/Modal.jsx';
import FormErrorList from '../../components/FormErrorList.jsx';
import { Duplicate } from '../../components/Icons.jsx';

let AuditCopyForm = React.createClass({
	getInitialState: function(){
		return {
			errors:{},
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
		copyAuditsFromTo(this.state.selectedAuditCycleId, this.props.params.auditCycleId).done((audits) => {
			Alert.success(`${audits.length} AUDITS COPIED`);
			hashHistory.push(`/audit_cycle/${this.props.params.auditCycleId}/audit`);
		}).fail(err => {
			this.setState({
				errors: err && err.responseJSON && err.responseJSON,
			});
		});
	},
	render : function(){
		let auditCycleOptions = [];
		for( let ac of this.props.otherAuditCycles){
			auditCycleOptions.push(<option key={ac.id} value={ac.id}>{ac.name}</option>);
		}
		return (
			<Modal modalTitle="Copy Audits" onClose={hashHistory.goBack}>
				<form onSubmit={this.onSubmit}>
					<FormErrorList errors={this.state.errors.non_field_errors}/>
					<FormSelect label="Audit Cycle" value={this.state.selectedAuditCycleId} name="selectedAuditCycleId" onChange={this.inputChanged} required="true">
						<option value="">Select Audit Cycle</option>
						{auditCycleOptions}
					</FormSelect>
					<button className="btn btn-primary btn-lg">
						<Duplicate/> Copy Audits
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
				if( auditCycles[id].id !== parseInt(ownProps.params.auditCycleId)){
					selectedCycles.push(auditCycles[id]);
				}
			}
			return selectedCycles;
		}(store.auditCycles))
	};
};

export default ReactRedux.connect( mapStoreToProps)(AuditCopyForm);
