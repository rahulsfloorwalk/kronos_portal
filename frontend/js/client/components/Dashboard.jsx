import React from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";

import AuditCycleTimeSeries from "./AuditCycleTimeSeries.jsx";
import AuditCycleStorePerformance from "./AuditCycleStorePerformance.jsx";
import DashboardCityPerformanceChart from "./DashboardCityPerformanceChart.jsx";

import Loading from "../../components/Loading.jsx";
// import QuestionnaireTypeTabs from "./QuestionnaireTypeTabs.jsx";
import QuestionnaireTypeTabsForDashboard from "./QuestionnaireTypeTabsForDashboard.jsx";

import { questionnaireTypeSelectors, auditCycleSelectors } from "../selectors";
import AuditCycleSelectorForDashboard from "./AuditCycleSelectorForDashboard.jsx";

const questionnaireTypePropType = PropTypes.shape({
	id: PropTypes.number.isRequired,
	name: PropTypes.string.isRequired,
});
const auditCyclePropType = PropTypes.shape({
	id: PropTypes.number.isRequired,
	name: PropTypes.string.isRequired,
	start_date: PropTypes.string.isRequired,
	end_date: PropTypes.string.isRequired,
});
export class Dashboard extends React.Component{
	static propTypes = {
		selectedQuestionnaireType: questionnaireTypePropType,
		selectedAuditCycle:auditCyclePropType
	};

	render(){
		return (
			<div>
				<QuestionnaireTypeTabsForDashboard />
				<AuditCycleSelectorForDashboard />
				<hr/>
				{ this.props.selectedQuestionnaireType && this.props.selectedAuditCycle ? <div>
					<AuditCycleTimeSeries questionnaireType={this.props.selectedQuestionnaireType} auditCycle={this.props.selectedAuditCycle}/>
					<hr/>
					<AuditCycleStorePerformance questionnaireType={this.props.selectedQuestionnaireType} auditCycle={this.props.selectedAuditCycle}/>
					<hr/>
					<DashboardCityPerformanceChart questionnaireType={this.props.selectedQuestionnaireType} auditCycle={this.props.selectedAuditCycle}/>
					<hr/>
				</div> : <Loading/> }
			</div>
		);
	}
}

const mapStateToProps = (state) => {
	return {
		selectedQuestionnaireType: questionnaireTypeSelectors.findSelectedQuestionnaireType(state),
		selectedAuditCycle: auditCycleSelectors.findSelectedAuditCycleBySelectedQuestionnaireType(state),
	};
};

export default connect(mapStateToProps)(Dashboard);
