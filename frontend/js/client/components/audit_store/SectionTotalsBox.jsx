import React from "react";
import PropTypes from "prop-types";

import { getColor } from "../../../utils.js";

export default class SectionTotalsBox extends React.Component {
	static propTypes = {
		sections: PropTypes.arrayOf(PropTypes.shape({
			id: PropTypes.number.isRequired,
			name: PropTypes.string.isRequired,
			max_marks: PropTypes.number.isRequired,
			sequence: PropTypes.number.isRequired,
		})),
		reportSections: PropTypes.arrayOf(PropTypes.shape({
			section: PropTypes.number.isRequired,
			marks_percentage: PropTypes.number.isRequired,
			color_code: PropTypes.number.isRequired,
			not_applicable: PropTypes.bool.isRequired,
		})),
	};
	render() {
		const rows = [];

		for(const s of this.props.sections){
			if( parseInt(s.max_marks) === 0){
				continue;
			}
			const reportSection = this.props.reportSections.filter((rs)=>rs.section === s.id)[0];

			let classes = "";
			let percent_marks;
			let notApplicable = false;

			if( reportSection){
				notApplicable = reportSection.not_applicable;
				percent_marks = parseInt(reportSection.marks_percentage);
				classes = getColor(reportSection.color_code);
			}

			let markingElement;
			let progressBarElement;
			if(notApplicable){
				markingElement = "";
				progressBarElement = (<span className="text-muted">not applicable</span>);
			} else {
				markingElement = `${percent_marks}%`;
				progressBarElement = (
					<div className="progress">
						<div className={"progress-bar " + "progress-bar-" + classes } role="progressbar" aria-valuenow={percent_marks} aria-valuemin="0" aria-valuemax="100" style={{width: percent_marks + "%"}}>
							{percent_marks}%
						</div>
					</div>
				);
			}


			rows.push(
				<tr key={s.id} className={""}>
					<td>{s.sequence}</td>
					<td><b>{s.name}</b></td>
					<td className="text-right">{markingElement}</td>
					<td className="">{progressBarElement}</td>
				</tr>
			);
		}

		return (
			<div className="panel panel-default">
				<div className="panel-heading">
					<h4 className="panel-title">Audit Summary</h4>
				</div>
				<table className="table table-condensed">
					<thead>
						<tr>
							<th style={{width:"5%"}}>#</th>
							<th style={{width:"35%"}}>Section</th>
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

