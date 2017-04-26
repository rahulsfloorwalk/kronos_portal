import React from 'react';
import $ from 'jquery';
import { hashHistory } from 'react-router';

import { findModerators, assign } from '../../manager/service/moderator.js';

import FormSelect from '../FormSelect.jsx';
import FormInput from '../FormInput.jsx';
import FormGroup from '../FormGroup.jsx';
import SaveButton from '../SaveButton.jsx';
import Modal from '../Modal.jsx';
import Loading from '../Loading.jsx';
import FormErrorList from '../FormErrorList.jsx';

export default React.createClass({
	getInitialState: function(){
		return {
			loading: false,
			moderators: [],
			selectedModerator: {
			},
			errors: {
			}
		};
	},
	setLoading: function(loadingState){
		this.setState((prevState) => {
			return Object.assign({}, prevState, {
				loading: loadingState
			});
		});
	},
	componentDidMount: function() {
		findModerators().then( (moderators) => {
			this.setState({
				moderators
			});
		});
	},
	fieldChanged: function(e){
		this.setState({
			moderator: Object.assign({}, this.state.moderator, getInputEventChangeValue(e))
		});
	},
	onSubmit: function(e){
		e.preventDefault();
		assign( this.props.params.auditCycleId,
			this.state.selectedModerator.id
		).then((savedModerator) => {
			hashHistory.push(`/audit_cycle/${this.props.params.auditCycleId}/moderator`);
		}, (errors) => {
			if (errors.responseJSON){
				this.setState({
					errors: errors.responseJSON
				});
			}
		});
	},
	selectModerator: function(e){
		this.setState({
			selectedModerator: this.state.moderators.filter( m => m.id === parseInt(e.target.value))[0]
		});
	},
	render : function(){
		if(this.state.loading){
			return (<Loading/>);
		}
		let modRows = [];
		for( let m of this.state.moderators){
			modRows.push(<option key={m.id} value={m.id}>{m.email}</option>);
		}
		return (
			<Modal modalTitle="Assign Moderator" onClose={hashHistory.goBack}>
				<form onSubmit={this.onSubmit}>
					<FormErrorList errors={this.state.errors.non_field_errors}/>
					<FormSelect value={this.state.selectedModerator.id} onChange={this.selectModerator}>
						<option value="">Select Moderator</option>
						{modRows}
					</FormSelect>
					<button className="btn btn-primary btn-lg">Assign</button>
				</form>
			</Modal>
		);
	},
});
