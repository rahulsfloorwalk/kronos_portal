import React from 'react';
import { Link } from 'react-router';

import { Check, Cross, Pencil, Plus, Knight } from '../../../components/Icons.jsx'

import { findModerators } from '../../service/moderator.js'

class ModeratorRow extends React.Component {
    render() {
		var is_active = this.props.moderator.is_active ? <Check/> : <Cross/>;
		return (
			<tr>
				<td>{this.props.moderator.email}</td>
				<td>{is_active}</td>
				<td>
					<Link to={`/moderator/${this.props.moderator.id}/edit`} className="btn btn-default"><Pencil/></Link>
				</td>
			</tr>
		);
	}
}

export default class extends React.Component {
    state = {
        moderators: [],
    };

    componentDidMount() {
		findModerators().then((moderators) => {
			this.setState({
				moderators
			});
		});
	}

    componentWillReceiveProps(nextProps) {
		console.log("componentWillReceiveProps", nextProps);
		this.componentDidMount();
	}

    render() {
		let rows = [];
		for(let moderator of this.state.moderators) {
			rows.push(<ModeratorRow moderator={moderator} key={moderator.id}/>);
		}
		var addModeratorLink = `/moderator/add`;
		return (
			<div>
				<h2 className="page-header">
					<Link to={addModeratorLink} className="btn btn-default pull-right"><Plus/> Add Moderator</Link>
					<Knight/> Moderators
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
	}
}
