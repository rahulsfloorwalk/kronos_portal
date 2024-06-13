import React from "react";
import { connect } from "react-redux";
import { Link } from "react-router";
import PropTypes from "prop-types";
import Alert from "react-s-alert";

import moment from "moment";
import { momentDateFormat }  from "../../../config.js";
import { url } from "../../../config.js";

import Loading from "../../components/Loading.jsx";
import Jumbotron from "../../components/Jumbotron.jsx";
import { Download } from "../../components/Icons.jsx";

import QuestionnaireTypeTabsForDashboard from "./QuestionnaireTypeTabsForDashboard.jsx";
import AuditCycleSelectorForDashboard from "./AuditCycleSelectorForDashboard.jsx";
import { auditCycleSelectors } from "../selectors";

import { getReportsActionListByAuditCycle, changeStatusActionPlan } from "../service/reports_action_plan.js";
import { getColorForActionPlanStatus } from "../../utils.js";

const auditCyclePropType = PropTypes.shape({
	id: PropTypes.number.isRequired,
	name: PropTypes.string.isRequired,
	start_date: PropTypes.string.isRequired,
	end_date: PropTypes.string.isRequired,
});

class ActionReports extends React.Component{
	static propTypes = {
		auditCycles: PropTypes.arrayOf(auditCyclePropType),
		selectedAuditCycle: auditCyclePropType,
	};

	state = {
		actionReports: [],
		loading: false,
		display: "none",
		action_plan_id: "",
		loading_modal: false,
		status_filter: ""
	};

	componentDidMount() {
		localStorage.removeItem("selectedTwitterHandle");
		if(this.props.selectedAuditCycle){
			this.getReportActionPlanList(this.props.selectedAuditCycle.id);
		}
	}

	componentWillReceiveProps(nextProps) {
		if(nextProps.selectedAuditCycle !== this.props.selectedAuditCycle){
			this.getReportActionPlanList(nextProps.selectedAuditCycle.id);
		}
	}

	getReportActionPlanList = (selectedAuditCycleId) => {
		this.setState({
			loading: true
		});
		getReportsActionListByAuditCycle(selectedAuditCycleId).then((actionReports) => {
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
		this.setState({
			loading_modal: true
		});
		changeStatusActionPlan(this.state.action_plan_id).then(() => {
			this.getReportActionPlanList(this.props.selectedAuditCycle.id);
			this.setState({
				display:"none",
				loading_modal: false
			});
			Alert.success("ACTION PLAN STATUS CHANGED");
		});
	};

	changeStatusFilter = (e) =>{
		this.setState({
			status_filter: e.target.value
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
		let excel_download_url = this.props.selectedAuditCycle ? url.api_base_path + `client/audit_cycle/${this.props.selectedAuditCycle.id}/action_reports_xlsx` : "";
		if(this.state.status_filter === "PENDING"){
			for(let a of this.state.actionReports){
				let status = <b style={{color: getColorForActionPlanStatus("Pending")}}>Action Pending</b>;
				if(a["status"] === "PENDING"){
					rows.push(
						<tr key={a["id"]}>
							<td>{a["audit_store_id"]}</td>
							<td>{a["person_responsible"]}</td>
							<td>{moment(a["target_date"]).format(momentDateFormat)}</td>
							<td>{a["store_details"]}</td>
							<td>{a["action_plan_description"]}</td>
							<td>{status}</td>
							<td>{a["created_by"]}</td>
							<td>
								{a["status"] === "PENDING" ? <button className="btn btn-success" onClick={ () => this.showModal(a["id"])}>Mark as Completed</button> : null}
								&nbsp;
								<Link to={`audit_store/${a["audit_store_id"]}`} target="_blank"><button className="btn btn-default">View Report</button></Link>
							</td>
						</tr>
					);
				}
			}
		}
		else if(this.state.status_filter === "TAKEN"){
			for(let a of this.state.actionReports){
				let status = <b style={{color: getColorForActionPlanStatus("Taken")}}>Action Taken</b>;
				if(a["status"] === "TAKEN"){
					rows.push(
						<tr key={a["id"]}>
							<td>{a["audit_store_id"]}</td>
							<td>{a["person_responsible"]}</td>
							<td>{moment(a["target_date"]).format(momentDateFormat)}</td>
							<td>{a["store_details"]}</td>
							<td>{a["action_plan_description"]}</td>
							<td>{status}</td>
							<td>{a["created_by"]}</td>
							<td>
								{a["status"] === "PENDING" ? <button className="btn btn-success" onClick={ () => this.showModal(a["id"])}>Mark as Completed</button> : null}
								&nbsp;
								<Link to={`audit_store/${a["audit_store_id"]}`} target="_blank"><button className="btn btn-default">View Report</button></Link>
							</td>
						</tr>
					);
				}
			}
		}
		else{
			for(let a of this.state.actionReports){
				let status = a["status"] === "PENDING" ? <b style={{color: getColorForActionPlanStatus("Pending")}}>Action Pending</b> : <b style={{color: getColorForActionPlanStatus("Taken")}}>Action Taken</b>;
				rows.push(
					<tr key={a["id"]}>
						<td>{a["audit_store_id"]}</td>
						<td>{a["person_responsible"]}</td>
						<td>{moment(a["target_date"]).format(momentDateFormat)}</td>
						<td>{a["store_details"]}</td>
						<td>{a["action_plan_description"]}</td>
						<td>{status}</td>
						<td>{a["created_by"]}</td>
						<td>
							{a["status"] === "PENDING" ? <button className="btn btn-success" onClick={ () => this.showModal(a["id"])}>Mark as Completed</button> : null}
							&nbsp;
							<Link to={`audit_store/${a["audit_store_id"]}`} target="_blank"><button className="btn btn-default">View Report</button></Link>
						</td>
					</tr>
				);
			}
		}
		if(this.state.loading){
			table = (<Loading/>);
		}
		else if(rows.length > 0){
			table = (
				<table className="table table-bordered table-hover table-responsive table-striped">
					<thead>
						<tr>
							<th>Report ID</th>
							<th>Person Responsible</th>
							<th>Target Date</th>
							<th>Store</th>
							<th>Action Plan</th>
							<th>Status</th>
							<th>Created By</th>
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
				<QuestionnaireTypeTabsForDashboard /><br/>
				<div className="form-group" style={{marginTop: "10px", verticalAlign: "top"}}>
					<AuditCycleSelectorForDashboard/>&nbsp;
					<div style={{width: "200px", display: "inline-block", verticalAlign: "top"}}>
						<label className="control-label" style={{fontSize: "18px"}}>&nbsp;Status:</label>
						<b>
							<select className="form-control" onChange={this.changeStatusFilter}>
								<option value="">All</option>
								<option value="PENDING">Action Pending</option>
								<option value="TAKEN">Action Taken</option>
							</select>
						</b>
					</div>
				</div>
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
							{
								!this.state.loading_modal ?
									<div className="modal-footer">
										<button type="button" className="btn btn-primary" onClick={this.submit_hideModal}>Yes</button>
										<button type="button" className="btn btn-default" onClick={this.hideModal}>No</button>
									</div>
									: <Loading/>
							}
						</div>
					</div>
				</div>
			</div>
		);
	}
}

const mapStateToProps = (state) => {
	return {
		auditCycles: auditCycleSelectors.findAuditCyclesBySelectedQuestionnaireType(state),
		selectedAuditCycle: auditCycleSelectors.findSelectedAuditCycleBySelectedQuestionnaireType(state)
	};
};

export default connect(mapStateToProps)(ActionReports);