import React from "react";
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
					<h4>Company Details</h4>
				</div>
				<table className="table table-striped">
					<colgroup>
						<col style={{width:"40%"}}/>
					</colgroup>
					<tbody>
						<tr>
							<th className="text-right">General Details</th>
							<th className=""></th>
						</tr>
						<tr>
							<td className="text-right text-muted">Agency Name:</td>
							<th>{ this.state.details.name }</th>
						</tr>
						<tr>
							<td className="text-right text-muted">Formed In:</td>
							<th>{ this.state.details.formed_in_year }</th>
						</tr>
						<tr>
							<td className="text-right text-muted">CIN:</td>
							<th>{ this.state.details.cin }</th>
						</tr>
						<tr>
							<td className="text-right text-muted">Company Workforce Strength:</td>
							<th>{ this.state.details.strength }</th>
						</tr>
						<tr>
							<th className="text-right">Financial Details</th>
							<th className=""></th>
						</tr>
						<tr>
							<td className="text-right text-muted">GSTIN:</td>
							<th>{ this.state.details.gstin }</th>
						</tr>
						{ this.state.details.is_ifsc_code_valid ?
							<tr>
								<td className="text-right text-muted">Bank Name:</td>
								<th>{ this.state.details.bank_name_from_ifsc }</th>
							</tr>
							: null }
						<tr className={this.state.details.is_ifsc_code_valid ? "" : "danger"}>
							<td className="text-right text-muted">IFSC Code:</td>
							<th>{ this.state.details.ifsc_code }</th>
						</tr>
						<tr>
							<td className="text-right text-muted">Bank Account Name:</td>
							<th>{ this.state.details.account_holder_name }</th>
						</tr>
						<tr>
							<td className="text-right text-muted">Account Number:</td>
							<th>{ this.state.details.account_number }</th>
						</tr>
					</tbody>
				</table>
			</div>
		);
	}
}
