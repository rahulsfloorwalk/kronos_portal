import React from "react";
import { Link } from "react-router";
import moment from "moment";
import { momentDateFormat }  from "../../../config.js";
import { url } from "../../../config.js";

import Loading from "../../components/Loading.jsx";
import Jumbotron from "../../components/Jumbotron.jsx";
import { Download } from "../../components/Icons.jsx";

import { getReportsActionList, changeStatusActionPlan } from "../service/reports_action_plan.js";
import { getColorForActionPlanStatus } from "../../utils.js";


export default class ActionReports extends React.Component{

	state = {
		actionReports: [],
		loading: false,
		display: "none",
		action_plan_id: ""
	};

	componentDidMount() {
		this.setState({
			loading: true
		});
		this.getReportActionPlanList();
	}

	getReportActionPlanList = () => {
		getReportsActionList().then((actionReports) => {
			this.setState({
				actionReports,
				loading: false
			});
		});
	};

	showModal(action_plan_id){
		this.setState({
			display:"block",
			action_plan_id: action_plan_id
		});
	}

	hideModal = () => {
		this.setState({ display:"none"});
	};
	submit_hideModal = () => {
		changeStatusActionPlan(this.state.action_plan_id).then(() => {
			this.getReportActionPlanList();
			this.setState({
				display:"none"
			});
		});
	};

	render(){
		const modalStyle = {
			display: this.state.display,
			overflow: "scroll"
		};
		const modalBackdropStyle = {
			zIndex: "1060",
			height: "100%"
		};
		const modalDialogStyle = {
			zIndex: "1070",
		};

		let rows = [];
		let table;
		let excel_download_url = url.api_base_path + "client/action_reports_xlsx";
		if(this.state.loading){
			return <Loading/>;
		}
		for(let a of this.state.actionReports){
			let status = a["status"] === "PENDING" ? <b style={{color: getColorForActionPlanStatus("Pending")}}>Action Pending</b> : <b style={{color: getColorForActionPlanStatus("Taken")}}>Action Taken</b>;
			rows.push(
				<tr key={a["id"]}>
					<td>{a["audit_store_id"]}</td>
					<td>{a["person_responsible"]}</td>
					<td>{moment(a["target_date"]).format(momentDateFormat)}</td>
					<td>{a["action_plan_description"]}</td>
					<td>{status}</td>
					<td>
						{a["status"] === "PENDING" ? <button className="btn btn-success" onClick={ () => this.showModal(a["id"])}>Mark as Completed</button> : null}
						&nbsp;
						<Link to={`audit_store/${a["audit_store_id"]}`} target="_blank"><button className="btn btn-default">View Report</button></Link>
					</td>
				</tr>
			);
		}
		if(rows.length > 0){
			table = (
				<table className="table table-bordered table-hover table-responsive table-striped">
					<thead>
						<tr>
							<th>Report ID</th>
							<th>Person Responsible</th>
							<th>Target Date</th>
							<th>Action Plan</th>
							<th>Status</th>
							<th>Action</th>
						</tr>
					</thead>
					<tbody>
						{rows}
					</tbody>
				</table>
			);
		}
		else{
			table = (<Jumbotron heading="there are no action plan reports" para=""/>);
		}
		return(
			<div>
				{
					rows.length > 0 ?
						<div className="btn-group pull-right hidden-print" style={{paddingBottom: "1%"}}>
							<a className="btn btn-default" href={excel_download_url}>
								Download Action Reports <Download/>
							</a>
						</div>
						: null
				}
				{table}
				<div className="modal" tabIndex="-1" style={modalStyle}>
					<div className="modal-backdrop fade in" style={modalBackdropStyle} onClick={this.hideModal}/>
					<div className="modal-dialog" style={modalDialogStyle}>
						<div className="modal-content">
							<div className="modal-header">
								<button type="button" className="close" onClick={this.hideModal}>&times;</button>
								<h4 className="modal-title">Change Status</h4>
							</div>
							<div className="modal-body">
								<label>Are you sure you want to change status?</label>
							</div>
							<div className="modal-footer">
								<button type="button" className="btn btn-primary" onClick={this.submit_hideModal}>Yes</button>
								<button type="button" className="btn btn-default" onClick={this.hideModal}>No</button>
							</div>
						</div>
					</div>
				</div>
			</div>
		);
	}
}