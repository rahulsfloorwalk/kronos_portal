import React from "react";
import { } from "react-router";

import { fetchUser } from "../service/user.js";

export default class UserDetailsBox extends React.Component{
	constructor(props){
		super(props);
		this.state = {
			loading: false,
			user: {},
		};
	}

	setLoading = (loading) => this.setState(prevState => Object.assign({}, prevState, {loading}));

	componentDidMount(){
		this.setLoading(true);
		fetchUser().then((user) => {
			this.setState({user});
		}).finally(() => this.setLoading(false));
	}

	render(){
		return (
			<div className="panel panel-default">
				<div className="panel-heading">
					<h4>Account Details</h4>
				</div>
				<table className="table table-striped">
					<tbody>
						<tr>
							<td className="text-right">Email:</td>
							<th>{this.state.user.email}</th>
						</tr>
						{ this.state.user.mobile_numbers && this.state.user.mobile_numbers.length > 0 ?
							<tr>
								<td className="text-right">Mobile Number:</td>
								<th>{this.state.user.mobile_numbers[0].mobile_number}</th>
							</tr>
							: null }
						<tr>
							<td className="text-right">Password:</td>
							<td><a href="/auth/password_change">Click here</a> to change your password.</td>
						</tr>
						<tr>
							<td colSpan="2" className="text-muted">
								<small>If you want to change your mobile number or email, please contact us.</small>
							</td>
						</tr>
					</tbody>
				</table>
			</div>
		);
	}
}
