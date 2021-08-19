import React from "react";
import PropTypes from "prop-types";

import moment from "moment";
import { momentDateFormat }  from "../.././config.js";

export default class ApplicationRepeat extends React.Component{
	static propTypes = {
		report_exists: PropTypes.bool,
		report_data: PropTypes.object
	};

	render(){
		var hover_title = "";

		if(this.props.report_exists === true){
			if(Object.keys(this.props.report_data).length > 0){
				hover_title = `Audit cycle: ${this.props.report_data.audit_cycle_name}\n\nAudit date: ${moment(this.props.report_data.audit_date).format(momentDateFormat)}`;
			}
		}

		switch(this.props.report_exists){
		case false:
			return <strong className="text-success">New</strong>;
		case true:
			return <strong className="text-danger" data-toggle="tooltip" title={hover_title} data-html="true">Repeat</strong>;
		case null:
			return <span>unkonwn</span>;
		default:
			return <strong>unknown</strong>;
		}
	}
}
