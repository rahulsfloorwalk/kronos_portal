import React from "react";
import PropTypes from "prop-types";
import {findActiveCustomer} from "../../service/admin_dashboard.js";

class ActiveCustomerRow extends React.Component{
	static propTypes={
		seq:PropTypes.number.isRequird,
		profile:PropTypes.shape({
			full_name:PropTypes.string,
			email:PropTypes.string,
			phone:PropTypes.string,
			is_verified:PropTypes.string
		})

	};

	render (){
		return(
			<tr>
				<td>{this.props.seq}</td>
				<td>{this.props.profile.full_name}</td>
				<td>{this.props.profile.email}</td>
				<td>{this.props.profile.phone}</td>
				<td>{this.props.profile.is_verified ? "Verfied" : "Not Verfied"}</td>
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
