import React, { Component } from "react";
import { connect } from "react-redux";
import PropTypes from "prop-types";

import Loading from "../../components/Loading.jsx";
import Jumbotron from "../../components/Jumbotron.jsx";
import DropDown from "../../components/DropDown.jsx";
import { Download, ChevronDown } from "../../components/Icons.jsx";

import QuestionnaireTypeTabs from "./QuestionnaireTypeTabs.jsx";
import AuditStoreTable from "./AuditStoreTable.jsx";
import AuditCycleSelector from "./AuditCycleSelector.jsx";

import CitySelector from  "./report_browser/CitySelector.jsx";
import EndDateSelector from  "./report_browser/EndDateSelector.jsx";
import StartDateSelector from  "./report_browser/StartDateSelector.jsx";
import StorePrioritySelector from  "./report_browser/StorePrioritySelector.jsx";
import StoreTypeSelector from  "./report_browser/StoreTypeSelector.jsx";

import DownloadDetailsButton from  "./report_browser/DownloadDetailsButton.jsx";
import DownloadSummaryButton from  "./report_browser/DownloadSummaryButton.jsx";

import { auditCycleSelectors, reportBrowserSelectors } from "../selectors";
import { fetchReportsByAuditCycleId } from "../actions/report_browser";

const auditCyclePropType = PropTypes.shape({
	id: PropTypes.number.isRequired,
	name: PropTypes.string.isRequired,
	start_date: PropTypes.string.isRequired,
	end_date: PropTypes.string.isRequired,
});

export class ReportBrowser3 extends Component{
	static propTypes = {
		auditCycles: PropTypes.arrayOf(auditCyclePropType),
		selectedAuditCycle: auditCyclePropType,
		reports: PropTypes.array,

		fetchReportsByAuditCycleId: PropTypes.func.isRequired,
	};

	componentDidMount() {
		if(this.props.selectedAuditCycle){
			this.props.fetchReportsByAuditCycleId(this.props.selectedAuditCycle.id);
		}
	}

	componentWillReceiveProps(nextProps) {
		if(nextProps.selectedAuditCycle !== this.props.selectedAuditCycle){
			this.props.fetchReportsByAuditCycleId(nextProps.selectedAuditCycle.id);
		}
	}

	render(){
		let table;
		if(this.props.auditCycles.length === 0){
			table = <Jumbotron heading="there are no reports here" para="yet"/>;
		} else if(this.props.selectedAuditCycle){
			table = <AuditStoreTable/>;
		} else {
			table = <Loading/>;
		}

		return (
			<div>
				<QuestionnaireTypeTabs />
				<div className="form-group" style={{marginTop: "10px", verticalAlign: "middle"}}>
					<AuditCycleSelector/>&nbsp;
					<CitySelector/>&nbsp;
					<StoreTypeSelector/>&nbsp;
					<StorePrioritySelector/>&nbsp;
					<StartDateSelector/>&nbsp;
					<EndDateSelector/>&nbsp;
					<div className="btn-group pull-right">
						&nbsp;Download:<br/>
						<button className="btn btn-default"
							title="Download Reports"
							onClick={() => this.reportDropdown && this.reportDropdown.toggle()}>
							<Download/> {this.props.reports.length} Reports &nbsp;
							<span className="caret"/>
						</button>
						<DropDown ref={(e) => this.reportDropdown = e}>
							<li><DownloadSummaryButton/></li>
							<li><DownloadDetailsButton/></li>
						</DropDown>
					</div>
				</div>
				{ table }
			</div>
		);
	}
}

const mapStateToProps = (state) => {
	return {
		auditCycles: auditCycleSelectors.findAuditCyclesBySelectedQuestionnaireType(state),
		selectedAuditCycle: auditCycleSelectors.findSelectedAuditCycleBySelectedQuestionnaireType(state),
		reports: reportBrowserSelectors.filterReports(state),
	};
};

export default connect(mapStateToProps, {
	fetchReportsByAuditCycleId,
})(ReportBrowser3);
