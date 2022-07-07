import React from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";

import AuditCycleTimeSeries from "./AuditCycleTimeSeries.jsx";
import AuditCycleImprovableQuestions from "./AuditCycleImprovableQuestions.jsx";
import QuestionnaireSurvey from "./QuestionnaireSurvey.jsx";
import AuditCycleStorePerformance from "./AuditCycleStorePerformance.jsx";
import DashboardCityPerformanceChart from "./DashboardCityPerformanceChart.jsx";
import DashboardRegionPerformanceChart from "./DashboardRegionPerformanceChart.jsx";
import DashboardClusterPerformanceChart from "./DashboardClusterPerformanceChart.jsx";
import AuditCycleScoreIndicator from "./AuditCycleScoreIndicator.jsx";

import Loading from "../../components/Loading.jsx";
// import QuestionnaireTypeTabs from "./QuestionnaireTypeTabs.jsx";
import QuestionnaireTypeTabsForDashboard from "./QuestionnaireTypeTabsForDashboard.jsx";

import { fetchUser } from "../actions/user";

import { questionnaireTypeSelectors, auditCycleSelectors, userSelectors } from "../selectors";
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
		selectedAuditCycle:auditCyclePropType,
		isClientAdmin: PropTypes.bool.isRequired,
		user: PropTypes.object.isRequired,

		fetchUser: PropTypes.func.isRequired,
	};

	componentDidMount() {
		this.props.fetchUser();
	}

	render(){
		return (
			<div>
				<QuestionnaireTypeTabsForDashboard />
				{ this.props.selectedQuestionnaireType && this.props.selectedAuditCycle && this.props.isClientAdmin ?
					<AuditCycleScoreIndicator questionnaireType={this.props.selectedQuestionnaireType} />
					: null
				}
				<hr/>
				<AuditCycleSelectorForDashboard />
				<hr/>
				{ this.props.selectedQuestionnaireType && this.props.selectedAuditCycle ? <div>
					<AuditCycleTimeSeries questionnaireType={this.props.selectedQuestionnaireType} auditCycle={this.props.selectedAuditCycle}/>
					<hr/>
					<AuditCycleImprovableQuestions questionnaireType={this.props.selectedQuestionnaireType} auditCycle={this.props.selectedAuditCycle}/>
					<hr/>
					<AuditCycleStorePerformance questionnaireType={this.props.selectedQuestionnaireType} auditCycle={this.props.selectedAuditCycle}/>
					<hr/>
					<DashboardCityPerformanceChart questionnaireType={this.props.selectedQuestionnaireType} auditCycle={this.props.selectedAuditCycle}/>
					<hr/>
					</div>
					: null }
				 { this.props.selectedQuestionnaireType && this.props.selectedAuditCycle && Object.keys(this.props.user).length !== 0 && this.props.user.user.client.id == 152 ? <div>
						<DashboardRegionPerformanceChart questionnaireType={this.props.selectedQuestionnaireType} auditCycle={this.props.selectedAuditCycle}/>
						<hr/>
						<DashboardClusterPerformanceChart questionnaireType={this.props.selectedQuestionnaireType} auditCycle={this.props.selectedAuditCycle}/>
						<hr/>
						</div>
					: null }
				{ this.props.selectedQuestionnaireType && this.props.selectedAuditCycle ? <div>
					<QuestionnaireSurvey questionnaireType={this.props.selectedQuestionnaireType} auditCycle={this.props.selectedAuditCycle}/>
				</div> : <Loading/> }
			</div>
		);
	}
}

const mapStateToProps = (state) => {
	return {
		selectedQuestionnaireType: questionnaireTypeSelectors.findSelectedQuestionnaireType(state),
		selectedAuditCycle: auditCycleSelectors.findSelectedAuditCycleBySelectedQuestionnaireType(state),
		isClientAdmin: userSelectors.isClientAdmin(state),
		user: state.user || {},
	};
};

export default connect(mapStateToProps,{
	fetchUser
})(Dashboard);
