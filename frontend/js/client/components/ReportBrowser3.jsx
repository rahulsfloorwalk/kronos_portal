import React, { Component } from "react";
import { connect } from "react-redux";
import PropTypes from "prop-types";

import Loading from "../../components/Loading.jsx";
import Jumbotron from "../../components/Jumbotron.jsx";

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

import { auditCycleSelectors } from "../selectors";
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

		fetchReportsByAuditCycleId: PropTypes.func.isRequired,
	};

	state = {
		loading: false,
	};

	setLoading = (loading) => {
		this.setState( prevState => {
			return Object.assign({}, prevState, {
				loading
			});
		});
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
		if(this.props.selectedAuditCycle){
			table = <AuditStoreTable auditCycleId={this.props.selectedAuditCycle.id} startDate={this.props.selectedAuditCycle.start_date} endDate={this.props.selectedAuditCycle.end_date}/>;
		} else {
			table = <Loading/>;
		}

		return (
			<div>
				<QuestionnaireTypeTabs />
				<div className="form-group">
					<AuditCycleSelector/>&nbsp;
					<CitySelector/>&nbsp;
					<StoreTypeSelector/>&nbsp;
					<StorePrioritySelector/>&nbsp;
					<StartDateSelector/>&nbsp;
					<EndDateSelector/>&nbsp;
					<DownloadSummaryButton/>
					<DownloadDetailsButton/>
				</div>
				{ this.props.auditCycles.length === 0 ?  <Jumbotron heading="there are no reports here" para="yet"/>
					: table
				}
			</div>
		);
	}
}

const mapStateToProps = (state) => {
	return {
		auditCycles: auditCycleSelectors.findAuditCyclesBySelectedQuestionnaireType(state),
		selectedAuditCycle: auditCycleSelectors.findSelectedAuditCycleBySelectedQuestionnaireType(state),
	};
};

export default connect(mapStateToProps, {
	fetchReportsByAuditCycleId,
})(ReportBrowser3);
