import React from "react";
import PropTypes from "prop-types";

import { getColor } from "../../../utils.js";

export default class ImpactFactorBox extends React.Component {
	static propTypes = {
		impactFactors: PropTypes.arrayOf(PropTypes.shape({
			name: PropTypes.string.isRequired,
			marks_obtained: PropTypes.number.isRequired,
			total_marks: PropTypes.number.isRequired,
			percentage: PropTypes.number.isRequired,
		})),
	};
	render() {
		const rows = [];

		for(const s of this.props.impactFactors){
			let color = Math.ceil(s.percentage/20);
			let classes = getColor(color);
			let markingElement = `${s.percentage}%`;
			let progressBarElement = (
				<div className="progress">
					<div className={"progress-bar " + "progress-bar-" + classes } role="progressbar" aria-valuenow={s.percentage} aria-valuemin="0" aria-valuemax="100" style={{width: s.percentage + "%"}}>
						{s.percentage}%
					</div>
				</div>
			);
			rows.push(
				<tr key={s.name} className={""}>
					<td><b>{s.name}</b></td>
					<td className="text-right">{markingElement}</td>
					<td className="">{progressBarElement}</td>
				</tr>
			);
		}

		return (
			<div className="panel panel-primary">
				<div className="panel-heading">
					<h4 className="panel-title">Impact Factors</h4>
				</div>
				<table className="table table-condensed">
					<thead>
						<tr>
							<th style={{width:"40%"}}>Name</th>
							<th className="text-right" style={{width:"10%"}}>Score</th>
							<th className="text-right" style={{width:"50%"}}></th>
						</tr>
					</thead>
					<tbody>
						{rows}
					</tbody>
				</table>
			</div>
		);
	}
}

