import React from "react";
import PropTypes from "prop-types";
import moment from "moment";
import { momentDateFormat }  from "../../../../config.js";

import { getColorForActionPlanStatus } from "../../../utils.js";

export default class SectionTotalsBox extends React.Component {
	static propTypes = {
		actionPlan: PropTypes.arrayOf(PropTypes.shape({
			id: PropTypes.number.isRequired,
			action_plan_description: PropTypes.string.isRequired,
			person_responsible: PropTypes.string.isRequired,
			target_date: PropTypes.string.isRequired,
			status: PropTypes.string.isRequired,
			audit_store_id: PropTypes.number.isRequired,
		})),
	};
	render() {
		if(this.props.actionPlan){
			let rows = [];
			for(let a of this.props.actionPlan){
				let status = a["status"] === "PENDING" ? <b style={{color: getColorForActionPlanStatus("Pending")}}>Action Pending</b> : <b style={{color: getColorForActionPlanStatus("Taken")}}>Action Taken</b>;
				rows.push(
					<tr key={a["id"]}>
						<td>{a["person_responsible"]}</td>
						<td>{moment(a["target_date"]).format(momentDateFormat)}</td>
						<td>{a["action_plan_description"]}</td>
						<td>{status}</td>
					</tr>
				);
			}
			return(
				<div className="panel panel-default">
					<div className="panel-heading">
						<h4 className="panel-title">Report Actions</h4>
					</div>
					<table className="table table-bordered table-hover table-responsive table-striped">
						<thead>
							<tr>
								<th style={{width:"15%"}}>Person Responsible</th>
								<th style={{width:"10%"}}>Target Date</th>
								<th style={{width:"60%"}}>Description</th>
								<th style={{width:"15%"}}>Status</th>
							</tr>
						</thead>
						<tbody>
							{rows}
						</tbody>
					</table>
				</div>
			);
		}
		else{
			return null;
		}
	}
}
