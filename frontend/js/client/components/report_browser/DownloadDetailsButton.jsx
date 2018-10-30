import React from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import moment from "moment";

import { Download } from "../../../components/Icons.jsx";
import { url } from "../../../../config.js";

import { auditCycleSelectors, reportBrowserSelectors } from "../../selectors";

export class DownloadDetailsButton extends React.Component {
	static propTypes = {
		auditCycle: PropTypes.shape({
			id: PropTypes.number.isRequired,
		}),
		cityId: PropTypes.number,
		storeType: PropTypes.string,
		storePriority: PropTypes.string,
		startDate: PropTypes.string,
		endDate: PropTypes.string,
		reportAttributes: PropTypes.object,
	};

	createDetailsFilterUrl(){
		let base = url.api_base_path + `client/audit_cycle/${this.props.auditCycle.id}/audit_cycle_filtered_xlsx_report?`;
		base += "city=" + encodeURIComponent(this.props.cityId || "");
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
			const detailsFilteredUrl = this.createDetailsFilterUrl();
			return (
				<a href={detailsFilteredUrl}>
					<h5><b>Detailed Excel</b></h5>
					<p className="text-muted">Download all reports with complete answers and commentary.</p>
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
		reportAttributes: reportBrowserSelectors.findReportAttributeSelectedOptionIds(store),
	};
};

export default connect(mapStateToProps)(DownloadDetailsButton);
