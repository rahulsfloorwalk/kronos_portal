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
			if( reportSection){
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
			}

			rows.push(
				<tr key={s.id} className={classes}>
					<td><b>{s.name}</b></td>
					<td className="text-right">{marks_obtained}</td>
					<td className="text-right">{s.max_marks}</td>
				</tr>
			);
		}

		return (
			<div className="panel panel-default">
				<div className="panel-heading">
					<h4 className="panel-title">Audit Summary</h4>
				</div>
				<table className="table">
					<thead>
						<tr>
							<th>Section</th>
							<th className="text-right">Marks</th>
							<th className="text-right">Max.</th>
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

