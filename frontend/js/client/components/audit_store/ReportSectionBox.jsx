import React from "react";
import PropTypes from "prop-types";

// import moment from "moment";
// import { momentDateFormat }  from "../../../../config.js";

import { File } from "../../../components/Icons.jsx";

const ReportSectionBox = (props) => {
	return (<div className="panel panel-default">
		<div className="panel-heading">
			<h4 className="panel-title"><File/> Report Section</h4>
		</div>
		<table className="table table-striped">
			<tbody>
				<tr>
					<th></th>
					<td className="text">{props.auditStore.report_summary ? props.auditStore.report_summary: ""}</td>
				</tr>
			</tbody>
		</table>
	</div>);
};


ReportSectionBox.propTypes = {
	auditStore: PropTypes.shape({
		report_summary:PropTypes.string,
	}),
};


export default ReportSectionBox;
