import React from "react";

export default class AttachmentLegend extends React.Component {

	render() {
		return (
			<div style={{display:"flex", alignItems: "center"}}>
				<span className="label label-danger">&nbsp;</span>
				<span>&nbsp;&nbsp;Mandatory&nbsp;&nbsp;</span>
				<span className="label label-warning">&nbsp;</span>
				<span>&nbsp;&nbsp;Not Mandatory&nbsp;&nbsp;</span>
				<span className="label label-primary">&nbsp;</span>
				<span>&nbsp;&nbsp;Attached</span>
			</div>
		);
	}
}
