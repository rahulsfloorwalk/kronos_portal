import React from "react";
import PropTypes from "prop-types";
import { pointerStyle } from "../../../styles.js";

export default class PrintToPDFButton extends React.Component {
	static propTypes = {
		sectionCount: PropTypes.number.isRequired,
	};
	render(){
		if(this.props.sectionCount <= 5) {
			return (
				<a onClick={() => window.print()} style={pointerStyle}>
					<h5><b>Print as PDF</b></h5>
					<p className="text-muted">Trigger your browser print dialog and select &#39;Save as PDF&#39;</p>
				</a>
			);
		} else {
			return null;
		}
	}
}
