import React from 'react';

import { Paperclip } from '../../js/components/Icons.jsx';

export default React.createClass({
	render: function(){
		var rows = [];

		for( let s of this.props.sections){
			if( parseInt(s.max_marks) === 0){
				continue;
			}
			var reportSection = this.props.reportSections.filter((rs)=>rs.section === s.id)[0];

			var classes = "";
			var marks_obtained = "";
			var percent_marks;
			let notApplicable = false;

			if( reportSection){
				notApplicable = reportSection.not_applicable;
				marks_obtained = reportSection.marks_obtained;
				if( parseFloat(reportSection.marks_obtained) <= parseFloat(s.max_marks) / 4){
					classes = "danger";
				} else if( parseFloat(reportSection.marks_obtained) <= parseFloat(s.max_marks) / 2){
					classes = "warning";
				} else if( parseFloat(reportSection.marks_obtained) <= parseFloat(s.max_marks) * 3/4){
					classes = "info";
				} else if( parseFloat(reportSection.marks_obtained) <= parseFloat(s.max_marks)){
					classes = "success";
				}

				percent_marks = parseInt(marks_obtained * 100 / s.max_marks);
			}

			let markingElement;
			let progressBarElement;
			if(notApplicable){
				markingElement = "";
				progressBarElement = (<span className="text-muted">not applicable</span>);
			} else {
				markingElement = `${marks_obtained}/${s.max_marks}`;
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
							<th className="text-right" style={{width:"10%"}}>Marks</th>
							<th className="text-right" style={{width:"50%"}}></th>
						</tr>
					</thead>
					<tbody>
						{rows}
					</tbody>
				</table>
			</div>
		);
	},
});

