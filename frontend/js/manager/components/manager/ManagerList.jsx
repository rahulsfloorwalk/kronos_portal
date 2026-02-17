import React from "react";
import PropTypes from "prop-types";
import { Link } from "react-router";

import { Check, Cross, Pencil, Plus, Queen } from "../../../components/Icons.jsx";

import { findManagers } from "../../service/manager.js";

class ManagerRow extends React.Component {
	static propTypes = {
		seq: PropTypes.number.isRequired,
		manager: PropTypes.shape({
			id: PropTypes.number,
			email: PropTypes.string,
			name: PropTypes.string,
			mobile: PropTypes.string,
			is_active: PropTypes.bool,
			is_admin: PropTypes.bool,
		}),
	};
	render() {
		var is_active = this.props.manager.is_active ? <Check/> : <Cross/>;
		var is_admin = this.props.manager.is_admin ? <Check /> : <Cross />;

		return (
			<tr>
				<td className="text-right">{this.props.seq}</td>
				<td>{this.props.manager.email}</td>
				<td>{this.props.manager.name}</td>
				<td>{this.props.manager.mobile}</td>
				<td>{is_active}</td>
				<td>{is_admin}</td>
				<td>
					<Link to={`/manager/${this.props.manager.id}/edit`} className="btn btn-default"><Pencil/></Link>
				</td>
				<td>
					<Link to={`/manager/${this.props.manager.id}/addcountry`} className="btn btn-default">Add Country</Link>
				</td>
			</tr>
		);
	}
}

export default class ManagerList extends React.Component {
	static propTypes = {
		children: PropTypes.node,
	};

	state = {
		managers: [],
	};

	componentDidMount() {
		findManagers().then((managers) => {
			this.setState({
				managers
			});
		});
	}

	componentWillReceiveProps() {
		this.componentDidMount();
	}

	render() {
		const rows = this.state.managers.map((m,i) => <ManagerRow seq={i+1} manager={m} key={m.id}/>);
		const addManagerLink = "/manager/add";
		return (
			<div className="table-responsive">
				<h2 className="page-header">
					<Link to={addManagerLink} className="btn btn-default pull-right"><Plus/> Add Manager</Link>
					<Queen/> Manager
				</h2>
				<table className="table table-striped">
					<thead>
						<tr>
							<th className="text-right">#</th>
							<th>Email Address</th>
							<th>Name</th>
							<th>Mobile</th>
							<th>Active</th>
							<th>Admin</th>
							<th></th>
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
	}
}
