import React from "react";
import PropTypes from "prop-types";
import { User, Dashboard, File, Star } from "../../../components/Icons.jsx";
import "../../../../css/bs_overrides.scss";

import {findAllCount} from "../../service/admin_dashboard.js";
export default class DashboardContainer extends React.Component {
	static propTypes = {
		children: PropTypes.node,
	};
	state={
		draft_order_count:0,
		complete_order_count:0,
		active_order_count:0,
		solution_count:0,
		user_count:0
	};
	componentDidMount(){
		findAllCount().then((all_count)=>{
			this.setState({
				draft_order_count:all_count.draft_order_count,
				complete_order_count:all_count.complete_order_count,
				active_order_count:all_count.active_order_count,
				solution_count:all_count.solution_count,
				user_count:all_count.user_count
			});
		});
	}
	render() {
		return (
			<div>
				<div className="container-fluid">
					<div className="row">
						<div className="col-md-3">
							<div className="panel panel-default">
								<div className="panel-body default_small_box" style={{ "maxHeight": "200px", "maxWidth": "100%" }}>
									<div>
										<h1>{this.state.user_count}</h1>
										<p>Total register customer</p>
									</div>
									<div className="default_small_box_icon"><User /></div>
								</div>
							</div>
						</div>
						<div className="col-md-3">
							<div className="panel panel-default">
								<div className="panel-body default_small_box" style={{ "maxHeight": "200px", "maxWidth": "100%" }}>
									<div>
										<h1>{this.state.solution_count}</h1>
										<p>Total Active Solution</p>
									</div>
									<div className="default_small_box_icon"><Star /></div>
								</div>
							</div>
						</div>
						<div className="col-md-3">
							<div className="panel panel-default">
								<div className="panel-body default_small_box" style={{ "maxHeight": "200px", "maxWidth": "100%" }}>
									<div>
										<h1>{this.state.active_order_count}</h1>
										<p>Total Active Order</p>
									</div>
									<div className="default_small_box_icon"><Dashboard /></div>
								</div>
							</div>
						</div>
						<div className="col-md-3">
							<div className="panel panel-default">
								<div className="panel-body default_small_box" style={{ "maxHeight": "200px", "maxWidth": "100%" }}>
									<div>
										<h1>{this.state.draft_order_count}</h1>
										<p>Total Draft Order</p>
									</div>
									<div className="default_small_box_icon"><File /></div>
								</div>
							</div>
						</div>
					</div>
				</div>
				<div className="panel panel-default table-responsive">
					<h3 style={{ padding: "2rem", borderBottom: "1px solid #eee" }}>
					Active Project
					</h3>

					<div style={{ padding: "2rem" }}>
						<table className="table table-striped">
							<thead>
								<tr>
									<th className="text-right">#</th>
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
				<div className="panel panel-default table-responsive">
					<h3 style={{ padding: "2rem", borderBottom: "1px solid #eee"}}>
Draft Project
					</h3>

					<div style={{ padding: "2rem" }}>
						<table className="table table-striped">
							<thead>
								<tr>
									<th className="text-right">#</th>
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
				<div className="panel panel-default table-responsive">
					<h3 style={{ padding: "2rem", borderBottom: "1px solid #eee"}}>
Complete Project
					</h3>

					<div style={{ padding: "2rem" }}>
						<table className="table table-striped">
							<thead>
								<tr>
									<th className="text-right">#</th>
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
			</div>
		);
	}
}
