import React from "react";
import PropTypes from "prop-types";

export default class DraftOrder extends React.Component {
	static propTypes = {
		children: PropTypes.node,
	};
	render() {

		return (
			<div className="panel panel-default table-responsive">
				<h3 style={{ padding: "2rem", borderBottom: "1px solid #eee"}}>
				Draft Order Table
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
							{/* {rows} */}
						</tbody>
					</table>
					{this.props.children}
				</div>
			</div>
		);
	}
}
