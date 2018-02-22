import React from 'react';
import { Link } from 'react-router';

import { Check, Cross, Pencil, Plus, Queen } from '../../../components/Icons.jsx'

import { findManagers } from '../../service/manager.js'

var ManagerRow = React.createClass({
	render: function(){
		var is_active = this.props.manager.is_active ? <Check/> : <Cross/>;
		return (
			<tr>
				<td>{this.props.manager.email}</td>
				<td>{is_active}</td>
				<td>
					<Link to={`/manager/${this.props.manager.id}/edit`} className="btn btn-default"><Pencil/></Link>
				</td>
			</tr>
		);
	},
});

export default React.createClass({
	getInitialState: function(){
		return {
			managers: [],
		};
	},
	componentDidMount: function() {
		findManagers().then((managers) => {
			this.setState({
				managers
			});
		});
	},
	componentWillReceiveProps: function(nextProps){
		console.debug("componentWillReceiveProps", nextProps);
		this.componentDidMount();
	},
	render: function(){
		let rows = [];
		for(let manager of this.state.managers) {
			rows.push(<ManagerRow manager={manager} key={manager.id}/>);
		}
		var addManagerLink = `/manager/add`;
		return (
			<div>
				<h2 className="page-header">
					<Link to={addManagerLink} className="btn btn-default pull-right"><Plus/> Add Manager</Link>
					<Queen/> Manager
				</h2>
				<table className="table table-striped">
					<thead>
						<tr>
							<th>Email Address</th>
							<th>Active</th>
							<th></th>
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
