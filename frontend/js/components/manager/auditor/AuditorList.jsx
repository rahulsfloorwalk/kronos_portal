import React from 'react';
import * as ReactRedux from 'react-redux';
import { Link } from 'react-router';

import { affectInputEventToComponent } from '../../../react_utils.js';
import { getGender } from '../../../utils.js';

import { setAuditorSearch } from '../../../manager/actions/auditor.js';
import { searchAuditors } from '../../../manager/service/auditor.js';

import { User, Search, Check, Cross } from '../../Icons.jsx';
import InputGroup from '../../InputGroup.jsx';
import { InputGroupBtn } from '../../InputGroup.jsx';
import FormInput from '../../FormInput.jsx';
import FormGroup from '../../FormGroup.jsx';
import SaveButton from '../../SaveButton.jsx';
import Loading from '../../Loading.jsx';

var AuditorRow = React.createClass({
	render: function(){
		var linkTo = `/auditor/${this.props.auditor.id}`;
		var prof = this.props.auditor.profileinfo || {};
		prof.city = prof.city || {};

		let activeIcon = this.props.auditor.is_active ? <Check/> : <Cross/>;
		return (
			<tr>
				<td>{prof.first_name} {prof.last_name}</td>
				<td>{this.props.auditor.email}</td>
				<td>{getGender(prof.gender)}</td>
				<td>{prof.mobile_number}</td>
				<td>{prof.city.name}</td>
				<td>{activeIcon}</td>
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
			auditors: [],
			loading: false,
			search: ""
		};
	},
	setLoading: function(loading){
		this.setState(prevState => Object.assign({}, prevState, {loading}));
	},
	searchAuditors: function(search){
		this.setLoading(true);
		searchAuditors(search).done((page) => {
			this.setState({
				auditors: page.results,
			});
		}).always(()=>this.setLoading(false));
	},
	componentDidMount: function() {
		this.setState({
			search: this.props.search
		});
		if( this.props.search && this.props.search !== ""){
			this.searchAuditors(this.props.search);
		}
	},
	onSubmit: function(e) {
		e.preventDefault();
		this.props.dispatch(setAuditorSearch(this.state.search));
		this.searchAuditors(this.state.search);
	},
	inputChanged: function(e){
		affectInputEventToComponent(e, this);
	},
	render: function(){
		let rows = [];
		for(let a of this.state.auditors) {
			rows.push(<AuditorRow auditor={a} key={a.id}/>);
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
							<th>Active</th>
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
		if(this.state.loading){
			var table = <Loading/>;
		}

		return (
			<div>
				<h2 className="page-header">
					<User/> Auditors
				</h2>
				<form className="form-group" onSubmit={this.onSubmit}>
					<InputGroup>
						<input className="form-control" placeholder="name, email, city or mobile number" name="search" value={this.state.search} onChange={this.inputChanged} required/>
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
		search: store.forms.auditorSearch.search
	};
};

export default ReactRedux.connect(mapStoreToProps)(AuditorList);
