import React from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";

import AuditCycleTimeSeries from "./AuditCycleTimeSeries.jsx";
import AuditCycleStorePerformance from "./AuditCycleStorePerformance.jsx";
import DashboardCityPerformanceChart from "./DashboardCityPerformanceChart.jsx";

import Loading from "../../components/Loading.jsx";
import QuestionnaireTypeTabs from "./QuestionnaireTypeTabs.jsx";

import { questionnaireTypeSelectors } from "../selectors";

const questionnaireTypePropType = PropTypes.shape({
	id: PropTypes.number.isRequired,
	name: PropTypes.string.isRequired,
});

export class Dashboard extends React.Component{
	static propTypes = {
		selectedQuestionnaireType: questionnaireTypePropType,
	};

	render(){
		return (
			<div>
				<QuestionnaireTypeTabs />
				{ this.props.selectedQuestionnaireType ? <div>
					<AuditCycleTimeSeries questionnaireType={this.props.selectedQuestionnaireType}/>
					<hr/>
					<AuditCycleStorePerformance questionnaireType={this.props.selectedQuestionnaireType}/>
					<hr/>
					<DashboardCityPerformanceChart questionnaireType={this.props.selectedQuestionnaireType}/>
					<hr/>
				</div> : <Loading/> }
			</div>
		);
	}
}

const mapStateToProps = (state) => {
	return {
		selectedQuestionnaireType: questionnaireTypeSelectors.findSelectedQuestionnaireType(state),
	};
};

export default connect(mapStateToProps)(Dashboard);
