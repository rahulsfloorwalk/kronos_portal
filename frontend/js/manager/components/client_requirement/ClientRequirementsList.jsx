import React from "react";
import PropTypes from "prop-types";
import { Link } from "react-router";
import {  Plus, Info } from "../../../components/Icons.jsx";


export default class ClientRequirementsList extends React.Component{
	static propTypes = {
		children: PropTypes.node,
		params: PropTypes.shape({
			clientId: PropTypes.string.isRequired,
		}).isRequired,
	};
	state = {
		clientrequirements: [],
	};
	render(){
		let addClientUserLink = `/client/${this.props.params.clientId}/client_requirements/add`;
		return (
			<div>
				<h3 className="page-header">
					<Link to={addClientUserLink} className="btn btn-default pull-right"><Plus/>Add Requirements</Link>
					<Info/> Client Requirements
				</h3>
				<table className="table table-striped">
					<thead>
						<tr>
							<th>Start Date</th>
							<th>End Date</th>
							<th>Audit Type</th>
							<th>Audit Category</th>
						</tr>
					</thead>
					{/* <tbody>
					</tbody> */}
				</table>
				{this.props.children}
			</div>
		);
	}
}
