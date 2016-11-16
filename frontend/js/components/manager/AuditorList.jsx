import React from 'react';
import * as ReactRedux from 'react-redux';
import { Link } from 'react-router';

import { affectInputEventToComponent } from '../../react_utils.js';

import { searchAuditors } from '../../manager_actions.js'
import InputGroup from '../InputGroup.jsx';
import { InputGroupBtn } from '../InputGroup.jsx';
import FormInput from '../FormInput.jsx';
import FormGroup from '../FormGroup.jsx';
import SaveButton from '../SaveButton.jsx';

var AuditorRow = React.createClass({
	render: function(){
		var linkTo = `/auditor/${this.props.auditor.id}`;
		return (
			<tr>
				<td>{this.props.auditor.profileinfo.first_name} {this.props.auditor.profileinfo.last_name}</td>
				<td>{this.props.auditor.email}</td>
				<td>{this.props.auditor.profileinfo.gender}</td>
				<td>{this.props.auditor.profileinfo.mobile_number}</td>
				<td>{this.props.auditor.profileinfo.city}</td>
				<td>
					<Link to={linkTo} className="btn btn-default pull-right">View</Link>
				</td>
			</tr>
		);
	},
});

var AuditorList = React.createClass({
	getInitialState: function() {
		return {
			search: ""
		};
	},
	componentDidMount: function() {
		this.setState({
			search: this.props.search
		});
		if( this.props.search && this.props.search !== ""){
			this.props.dispatch(searchAuditors(this.props.search));
		}
	},
	onSubmit: function(e) {
		console.debug("form sub dsadasd!");
		e.preventDefault();
		this.props.dispatch(searchAuditors(this.state.search));
	},
	inputChanged: function(e){
		affectInputEventToComponent(e, this);
	},
	render: function(){
		var rows = []; 
		for(var id in this.props.auditors) {
			rows.push(<AuditorRow auditor={this.props.auditors[id]} key={id}/>);
		}
		return (
			<div>
				<h2 className="page-header">
					Auditors
				</h2>
				<form onSubmit={this.onSubmit}>
					<InputGroup>
						<input className="form-control" placeholder="name, email or mobile number" name="search" value={this.state.search} onChange={this.inputChanged} required/>
						<InputGroupBtn>
							<SaveButton text="Search"/>
						</InputGroupBtn>
					</InputGroup>
				</form>
				<table className="table table-striped">
					<thead>
						<tr>
							<th>Full Name</th>
							<th>Email</th>
							<th>Gender</th>
							<th>Mobile Number</th>
							<th>City</th>
						</tr>
					</thead>
					<tbody>
						{rows}
					</tbody>
				</table>
				{this.props.children}
			</div>
		);
	},
});

var mapStoreToProps = function(store){
	return {
		auditors: store.auditors,
		search: store.forms.auditorSearch.search
	};
};

export default ReactRedux.connect(mapStoreToProps)(AuditorList); 
