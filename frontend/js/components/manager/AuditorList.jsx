import React from 'react';
import * as ReactRedux from 'react-redux';
import { Link } from 'react-router';

import { affectInputEventToComponent } from '../../react_utils.js';
import { getGender } from '../../utils.js';

import { searchAuditors } from '../../manager/actions/auditor.js'

import { User, Search } from '../Icons.jsx';
import InputGroup from '../InputGroup.jsx';
import { InputGroupBtn } from '../InputGroup.jsx';
import FormInput from '../FormInput.jsx';
import FormGroup from '../FormGroup.jsx';
import SaveButton from '../SaveButton.jsx';

var AuditorRow = React.createClass({
	render: function(){
		var linkTo = `/auditor/${this.props.auditor.id}`;
		var prof = this.props.auditor.profileinfo || {};
		prof.city = prof.city || {};
		return (
			<tr>
				<td>{prof.first_name} {prof.last_name}</td>
				<td>{this.props.auditor.email}</td>
				<td>{getGender(prof.gender)}</td>
				<td>{prof.mobile_number}</td>
				<td>{prof.city.name}</td>
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
		if(rows.length > 0){
			var table = (
				<table className="table table-striped">
					<thead>
						<tr>
							<th>Full Name</th>
							<th>Email</th>
							<th>Gender</th>
							<th>Mobile Number</th>
							<th>City</th>
							<th></th>
						</tr>
					</thead>
					<tbody>
						{rows}
					</tbody>
				</table>
			);
		} else {
			var table = (
				<div className="jumbotron text-center">
					<h2>no results found</h2>
					<p>try modifying your search terms a bit..</p>
				</div>
			);
		}

		return (
			<div>
				<h2 className="page-header">
					<User/> Auditors
				</h2>
				<form className="form-group" onSubmit={this.onSubmit}>
					<InputGroup>
						<input className="form-control" placeholder="name, email or mobile number" name="search" value={this.state.search} onChange={this.inputChanged} required/>
						<InputGroupBtn>
							<SaveButton text={<span><Search/> Search</span>}/>
						</InputGroupBtn>
					</InputGroup>
				</form>
				{table}
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
