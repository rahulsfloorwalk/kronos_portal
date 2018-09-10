import React from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";

import AuditCycleTimeSeries from "./AuditCycleTimeSeries.jsx";
import AuditCycleStorePerformance from "./AuditCycleStorePerformance.jsx";
import DashboardCityPerformanceChart from "./DashboardCityPerformanceChart.jsx";

import { Dashboard as DashboardIcon } from "../../components/Icons.jsx";

import Loading from "../../components/Loading.jsx";
import QuestionnaireTypeTabs from "./QuestionnaireTypeTabs.jsx";

import { findSelectedQuestionnaireType, findDefaultQuestionnaireType, findFirstQuesionnaireType } from "../reducers/questionnaire_type";

const questionnaireTypePropType = PropTypes.shape({
	id: PropTypes.number.isRequired,
	name: PropTypes.string.isRequired,
});

export class Dashboard extends React.Component{
	static propTypes = {
		selectedQuestionnaireType: questionnaireTypePropType,
		defaultQuestionnaireType: questionnaireTypePropType,
		firstQuestionnaireType: questionnaireTypePropType,
	};

	render(){
		const selectedQuestionnaireType = this.props.selectedQuestionnaireType || this.props.defaultQuestionnaireType || this.props.firstQuestionnaireType;

		return (
			<div>
				<h2 className="page-header"><DashboardIcon/> Dashboard</h2>
				<QuestionnaireTypeTabs />
				{ selectedQuestionnaireType ? <div>
					<AuditCycleTimeSeries questionnaireType={selectedQuestionnaireType}/>
					<hr/>
					<AuditCycleStorePerformance questionnaireType={selectedQuestionnaireType}/>
					<hr/>
					<DashboardCityPerformanceChart questionnaireType={selectedQuestionnaireType}/>
					<hr/>
				</div> : <Loading/> }
			</div>
		);
	}
}

const mapStateToProps = (state) => {
	return {
		selectedQuestionnaireType: findSelectedQuestionnaireType(state),
		defaultQuestionnaireType: findDefaultQuestionnaireType(state),
		firstQuestionnaireType: findFirstQuesionnaireType(state),
	};
};

export default connect(mapStateToProps)(Dashboard);
