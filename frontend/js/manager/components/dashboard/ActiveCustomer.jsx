import React from "react";
import PropTypes from "prop-types";
import {findActiveCustomer} from "../../service/admin_dashboard.js";

class ActiveCustomerRow extends React.Component{
	static propTypes = {
		seq: PropTypes.number.isRequired,
		profile: PropTypes.shape({
			first_name: PropTypes.string,
			last_name: PropTypes.string,
			user: PropTypes.shape({
				email: PropTypes.string,
				is_active: PropTypes.bool
			}),
			mobile_number: PropTypes.string,
		})
	};
	render (){
		return(
			<tr>
				<td>{this.props.seq}</td>
				<td>{this.props.profile.first_name && this.props.profile.first_name ? `${this.props.profile.first_name} ${this.props.profile.last_name}` : null} </td>
				<td>{this.props.profile.user.email}</td>
				<td>{this.props.profile.mobile_number}</td>
				<td>{this.props.profile.user.is_active ? "Verfied" : "Not Verfied"}</td>
			</tr>
		);
	}
}
export default class ActiveCustomer extends React.Component {
	static propTypes = {
		children: PropTypes.node,
	};
	state={
		profile:[],
	};
	componentDidMount(){
		findActiveCustomer().then((profile)=>{
			this.setState({
				profile
			});
		});
	}
	componentWillReceiveProps() {
		this.componentDidMount();
	}
	render() {
		const rows = this.state.profile.map((p,i)=><ActiveCustomerRow seq={i+1} profile={p} key={p.id}/>);
		return (
			<div className="panel panel-default table-responsive">
				<h3 style={{ padding: "2rem", borderBottom: "1px solid #eee"}}>
					Active Customer
				</h3>

				<div style={{ padding: "2rem" }}>
					<table className="table table-striped">
						<thead>
							<tr>
								<th>#</th>
								<th>Full Name</th>
								<th>Email</th>
								<th>Mobile</th>
								<th>Customer Status</th>
								{/* <th>&nbsp;</th> */}
							</tr>
						</thead>
						<tbody>
							{rows}
						</tbody>
					</table>
					{this.props.children}
				</div>
			</div>
		);
	}
}
