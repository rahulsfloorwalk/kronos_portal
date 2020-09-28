import React from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import moment from "moment";

import { url } from "../../../../config.js";

import { auditCycleSelectors, reportBrowserSelectors } from "../../selectors";

export class DownloadSummaryButton extends React.Component {
	static propTypes = {
		auditCycle: PropTypes.shape({
			id: PropTypes.number.isRequired,
		}),
		cityId: PropTypes.number,
		state: PropTypes.string,
		country: PropTypes.string,
		storeType: PropTypes.string,
		storePriority: PropTypes.string,
		startDate: PropTypes.string,
		endDate: PropTypes.string,
		reportAttributes: PropTypes.object,
	};

	createSummaryFilterUrl(){
		let base = url.api_base_path + `client/audit_cycle/${this.props.auditCycle.id}/report_browser_filtered_xlsx_report?`;
		base += "city=" + encodeURIComponent(this.props.cityId || "");
		base += "&state=" + encodeURIComponent(this.props.state || "");
		base += "&country=" + encodeURIComponent(this.props.country || "");
		base += "&priority=" + encodeURIComponent(this.props.storePriority || "");
		base += "&start_date=" + encodeURIComponent(moment(this.props.startDate).format("YYYY-MM-DD") || "");
		base += "&end_date=" + encodeURIComponent(moment(this.props.endDate).format("YYYY-MM-DD") || "");
		base += "&type=" + encodeURIComponent(this.props.storeType || "");
		for(let jsonId in this.props.reportAttributes){
			base += "&attribute=" + encodeURIComponent(jsonId + ":" + this.props.reportAttributes[jsonId]);
		}
		return base;
	}
	render(){
		if(this.props.auditCycle){
			const summaryFilteredUrl = this.createSummaryFilterUrl();
			return (
				<a href={summaryFilteredUrl}>
					<h5><b>Summary Excel</b></h5>
					<p className="text-muted">Download summary of all reports with section based scores.</p>
				</a>
			);
		} else {
			return null;
		}
	}
}

const mapStateToProps = (store) => {
	return {
		auditCycle: auditCycleSelectors.findSelectedAuditCycleBySelectedQuestionnaireType(store),
		cityId: reportBrowserSelectors.findSelectedCityId(store),
		state : reportBrowserSelectors.findSelectedState(store),
		country : reportBrowserSelectors.findSelectedCountry(store),
		storeType: reportBrowserSelectors.findSelectedStoreType(store),
		storePriority: reportBrowserSelectors.findSelectedStorePriority(store),
		startDate: reportBrowserSelectors.findSelectedStartDateBySelectedAuditCycle(store),
		endDate: reportBrowserSelectors.findSelectedEndDateBySelectedAuditCycle(store),
		reportAttributes: reportBrowserSelectors.findReportAttributeSelectedOptionIds(store),
	};
};

export default connect(mapStateToProps)(DownloadSummaryButton);
