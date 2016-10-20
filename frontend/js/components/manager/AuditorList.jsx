import React from 'react';
import * as ReactRedux from 'react-redux';
import { Link } from 'react-router';

import { fetchAuditors } from '../../actions.js'

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
	componentDidMount: function() {
		this.props.dispatch(fetchAuditors());
	},
	render: function(){
		var rows = [];
		for(var id in this.props.auditors) {
			rows.push(<AuditorRow auditor={this.props.auditors[id]} key={id}/>);
		}
		return (
			<div>
				<h2 className="page-header">
					Auditor List
				</h2>
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
		auditors: store.auditors
	};
};

export default ReactRedux.connect(mapStoreToProps)(AuditorList); 
