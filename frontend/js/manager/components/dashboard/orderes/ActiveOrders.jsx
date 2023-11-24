import React from "react";
import PropTypes from "prop-types";
import { url } from "../../../../../config";

export default class ActiveOrders extends React.Component {
	static propTypes = {
		children: PropTypes.node,
	};
	state = {
		orders: [],
	};
	componentDidMount() {
		fetch(url.api_base_path + "manager/mp/manager_dashbord_mporder_list?status=ACTIVE")
			.then(response => response.json())
			.then(data => this.setState({ orders: data.mp_order_data }))
			.catch(error => console.error("There was an error!", error));
	}
	render() {

		return (
			<div className="panel panel-default table-responsive">
				<h3 style={{ padding: "2rem", borderBottom: "1px solid #eee" }}>
					Active Order Table
				</h3>

				<div style={{ padding: "2rem" }}>
					<table className="table table-striped">
						<thead>
							<tr>
								<th>Order Id</th>
								<th>Order Date</th>
								<th>Name</th>
								<th>Solutions Name</th>
								<th>Category</th>
								<th>Total Responses</th>
								<th>Order Status</th>
							</tr>
						</thead>
						<tbody>
							{this.state.orders.length > 0 ? this.state.orders.map((order) => {
								const date = new Date(order.mp_order.created_at);
								const formattedDate = date.toLocaleDateString("en-GB");

								return (
									<tr key={order.mp_order.id}>
										<td>{order.mp_order.id}</td>
										<td>{formattedDate}</td>
										<td>{order.mp_order.user.email}</td>
										<td>{order.mp_order.solution.name}</td>
										<td>{order.mp_order.category_name}</td>
										<td>{order.mp_order.no_of_response}</td>
										<td>{order.mp_order.status}</td>
									</tr>
								);
							})
								:
								<tr><td>No Active Order Now...</td></tr>
							}
						</tbody>
					</table>
					{this.props.children}
				</div>
			</div>
		);
	}
}
