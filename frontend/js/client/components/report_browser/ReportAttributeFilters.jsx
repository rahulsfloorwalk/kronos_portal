import React from "react";
import { connect } from "react-redux";
import PropTypes from "prop-types";

import { reportAttributePropType, auditCyclePropType } from "../../prop_types";
import {auditCycleSelectors, reportAttributeSelectors } from "../../selectors";
import ReportAttributeFilter from "./ReportAttributeFilter.jsx";
import { fetchReportAttributesByAuditCycleId } from "../../actions/report_attribute";

export class ReportAttributeFilters extends React.Component {
	static propTypes = {
		reportAttributes: PropTypes.arrayOf(reportAttributePropType),
		selectedAuditCycle: auditCyclePropType,

		fetchReportAttributesByAuditCycleId: PropTypes.func.isRequired,
	};

	componentDidMount() {
		if(this.props.selectedAuditCycle){
			this.props.fetchReportAttributesByAuditCycleId(this.props.selectedAuditCycle.id);
		}
	}

	componentWillReceiveProps(nextProps) {
		if(nextProps.selectedAuditCycle !== this.props.selectedAuditCycle){
			nextProps.fetchReportAttributesByAuditCycleId(nextProps.selectedAuditCycle.id);
		}
	}
	render() {
		return (<span> {
			this.props.reportAttributes.map((ra) => <ReportAttributeFilter
				key={ra.id}
				reportAttribute={ra}
			/>)
		}</span>);
	}
}

const mapStateToProps = (state) => {
	return {
		selectedAuditCycle: auditCycleSelectors.findSelectedAuditCycleBySelectedQuestionnaireType(state),
		reportAttributes: reportAttributeSelectors.findReportAttributesBySelectedAuditCycle(state),
	};
};

export default connect(mapStateToProps, {
	fetchReportAttributesByAuditCycleId,
})(ReportAttributeFilters);
