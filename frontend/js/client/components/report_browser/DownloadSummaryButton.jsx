import React from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import moment from "moment";

import { Download, Excel } from "../../../components/Icons.jsx";
import { url } from "../../../../config.js";

import { auditCycleSelectors, reportBrowserSelectors } from "../../selectors";

export class DownloadSummaryButton extends React.Component {
	static propTypes = {
		auditCycle: PropTypes.shape({
			id: PropTypes.number.isRequired,
		}),
		cityId: PropTypes.number,
		storeType: PropTypes.string,
		storePriority: PropTypes.string,
		startDate: PropTypes.string,
		endDate: PropTypes.string,
	};

	createSummaryFilterUrl(){
		let base = url.api_base_path + `client/audit_cycle/${this.props.auditCycle.id}/report_browser_filtered_xlsx_report?`;
		base += "city=" + encodeURIComponent(this.props.cityId || "");
		base += "&priority=" + encodeURIComponent(this.props.storePriority || "");
		base += "&start_date=" + encodeURIComponent(moment(this.props.startDate).format("YYYY-MM-DD") || "");
		base += "&end_date=" + encodeURIComponent(moment(this.props.endDate).format("YYYY-MM-DD") || "");
		base += "&type=" + encodeURIComponent(this.props.storeType || "");
		//base += "month=" + encodeURIComponent(Number(this.props.selectedMonth)+1 || "");
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
		storeType: reportBrowserSelectors.findSelectedStoreType(store),
		storePriority: reportBrowserSelectors.findSelectedStorePriority(store),
		startDate: reportBrowserSelectors.findSelectedStartDateBySelectedAuditCycle(store),
		endDate: reportBrowserSelectors.findSelectedEndDateBySelectedAuditCycle(store),
	};
};

export default connect(mapStateToProps)(DownloadSummaryButton);
