import React from "react";
import PropTypes from "prop-types";
import { User, Dashboard, File, Star } from "../../../components/Icons.jsx";
import "../../../../css/bs_overrides.scss";


export default class DashboardContainer extends React.Component {
	static propTypes = {
		children: PropTypes.node,
	};
	render() {

		return (
			<div>
				<div className="container-fluid">
					<div className="row">
						<div className="col-md-3">
							<div className="panel panel-default">
								<div className="panel-body default_small_box" style={{ "maxHeight": "200px", "maxWidth": "100%" }}>
									<div>
										<h1>35</h1>
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
										<h1>10</h1>
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
										<h1>29</h1>
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
										<h1>69</h1>
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
