import React from "react";
import PropTypes from "prop-types";

import { } from "../../../components/Icons.jsx";
import Loading from "../../../components/Loading.jsx";

import { fetchAgencyUser } from "../../service/agency_user.js";

export default class AgencyUserDetailsPanel extends React.Component{
	static propTypes = {
		userId: PropTypes.number.isRequired,
	};

	constructor(props) {
		super(props);
		this.state = {
			loading: false,
			user: null,
		};
	}

	setLoading = (loading) => this.setState(prevState => Object.assign({}, prevState, { loading }));

	componentDidMount(){
		this.setLoading(true);
		fetchAgencyUser(this.props.userId).then((user)=>this.setState({user})).always(this.setLoading(false));
	}

	render(){
		if(this.state.loading || ! this.state.user){
			return <Loading/>;
		}
		return (
			<div className="panel panel-default">
				<div className="panel-heading">
					<h4>Agency Details</h4>
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
							<td className="text-right text-muted">Email:</td>
							<th>{ this.state.user.email }</th>
						</tr>
						<tr>
							<td className="text-right text-muted">Mobile Number:</td>
							<th>{ this.state.user.mobile_numbers.length > 0 ? this.state.user.mobile_numbers[0].mobile_number : null }</th>
						</tr>
						<tr>
							<td className="text-right text-muted">Agency Name:</td>
							<th>{ this.state.user.agencyuser.agency.name }</th>
						</tr>
						<tr>
							<td className="text-right text-muted">Formed In:</td>
							<th>{ this.state.user.agencyuser.agency.formed_in_year }</th>
						</tr>
						<tr>
							<td className="text-right text-muted">CIN:</td>
							<th>{ this.state.user.agencyuser.agency.cin }</th>
						</tr>
						<tr>
							<td className="text-right text-muted">Company Workforce Strength:</td>
							<th>{ this.state.user.agencyuser.agency.strength }</th>
						</tr>
						<tr>
							<th className="text-right">Financial Details</th>
							<th className=""></th>
						</tr>
						<tr>
							<td className="text-right text-muted">GSTIN:</td>
							<th>{ this.state.user.agencyuser.agency.gstin }</th>
						</tr>
						{ this.state.user.is_ifsc_code_valid ?
							<tr>
								<td className="text-right text-muted">Bank Name:</td>
								<th>{ this.state.user.agencyuser.agency.bank_name_from_ifsc }</th>
							</tr>
							: null }
						<tr className={this.state.user.is_ifsc_code_valid ? "" : "danger"}>
							<td className="text-right text-muted">IFSC Code:</td>
							<th>{ this.state.user.agencyuser.agency.ifsc_code }</th>
						</tr>
						<tr>
							<td className="text-right text-muted">Bank Account Name:</td>
							<th>{ this.state.user.agencyuser.agency.account_holder_name }</th>
						</tr>
						<tr>
							<td className="text-right text-muted">Account Number:</td>
							<th>{ this.state.user.agencyuser.agency.account_number }</th>
						</tr>
					</tbody>
				</table>
			</div>
		);
	}
}
