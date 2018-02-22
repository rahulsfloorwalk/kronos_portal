import React from "react";
import PropTypes from "prop-types";
import { } from "react-redux";
import { Link } from "react-router";

import { } from "../../styles.js";

import { Pencil } from "../../components/Icons.jsx";
import Loading from "../../components/Loading.jsx";

import { fetchAgency } from "../service/details.js";

export default class AgencyDetailsPanel extends React.Component{
	static propTypes = {
	};

	constructor(props) {
		super(props);
		this.state = {
			hover: false,
			expanded: false,
			loading: false,
			details: {},
		};
	}

	setLoading = (loading) => this.setState(prevState => Object.assign({}, prevState, { loading }));

	componentDidMount(){
		this.setLoading(true);
		fetchAgency().then((details)=>this.setState({details})).finally(this.setLoading(false));
	}

	render(){
		if(this.state.loading){
			return <Loading/>;
		}
		return (
			<div className="panel panel-default">
				<div className="panel-heading">
					<Link to="agency/edit" className="btn btn-default pull-right"><Pencil/> Edit</Link>
					<h4>Agency Details</h4>
				</div>
				<table className="table table-striped">
					<colgroup>
						<col style={{width:"40%"}}/>
					</colgroup>
					<tbody>
						<tr>
							<td className="text-right text-muted">Agency Name:</td>
							<th>{ this.state.details.name }</th>
						</tr>
						<tr>
							<td className="text-right text-muted">Formed In:</td>
							<th>{ this.state.details.formed_in_year }</th>
						</tr>
						<tr>
							<td className="text-right text-muted">GSTIN:</td>
							<th>{ this.state.details.gstin }</th>
						</tr>
						<tr>
							<td className="text-right text-muted">CIN:</td>
							<th>{ this.state.details.cin }</th>
						</tr>
						<tr>
							<td className="text-right text-muted">Company Workforce Strength:</td>
							<th>{ this.state.details.strength }</th>
						</tr>
					</tbody>
				</table>
			</div>
		);
	}
}
