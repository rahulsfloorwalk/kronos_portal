import React, { Component } from "react";
import { connect } from "react-redux";
import PropTypes from "prop-types";

import Loading from "../../components/Loading.jsx";
import Jumbotron from "../../components/Jumbotron.jsx";

import QuestionnaireTypeTabs from "./QuestionnaireTypeTabs.jsx";
import AuditStoreTable from "./AuditStoreTable.jsx";
import AuditCycleSelector from "./AuditCycleSelector.jsx";

import { auditCycleSelectors, questionnaireTypeSelectors } from "../selectors";

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
				<h2 className="page-header">
					<AuditCycleSelector />
				</h2>
				{ this.props.auditCycles.length === 0 ?  <Jumbotron heading="there are no reports here" para="yet"/>
					: table
				}
			</div>
		);
	}
}

const mapStateToProps = (state) => {
	const selectedQuestionnaireType = questionnaireTypeSelectors.findSelectedQuestionnaireType(state);
	if(selectedQuestionnaireType) {
		return {
			auditCycles: auditCycleSelectors.findAuditCyclesByQuestionnaireType(state, selectedQuestionnaireType.id),
			selectedAuditCycle: auditCycleSelectors.findSelectedAuditCycle(state, selectedQuestionnaireType.id),
		};
	} else {
		return {
			auditCycles: [],
		};
	}
};

export default connect(mapStateToProps)(ReportBrowser3);
