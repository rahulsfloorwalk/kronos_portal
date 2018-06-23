import React from "react";
import { pointerStyle } from "../../styles.js";

import AuditCycleTimeSeries from "./AuditCycleTimeSeries.jsx";
import AuditCycleStorePerformance from "./AuditCycleStorePerformance.jsx";
import DashboardCityPerformanceChart from "./DashboardCityPerformanceChart.jsx";

import { Dashboard as DashboardIcon } from "../../components/Icons.jsx";

import Loading from "../../components/Loading.jsx";

import { fetchQuestionnaireTypes } from "../service/dashboard.js";

export default class Dashboard extends React.Component{
	state =  {
		questionnaireTypes: [],
		selectedQuestionnaireTypeId: null,
	};

	componentDidMount(){
		fetchQuestionnaireTypes().then(questionnaireTypes => {
			this.setState({
				questionnaireTypes,
			});
		});
	}

	selectQuestionnaireType = (questionnaireType) => {
		this.setState({
			selectedQuestionnaireTypeId: questionnaireType.id,
		});
	};

	getSelectedQuestionnaireType = () => {
		return this.state.questionnaireTypes.find(qt => qt.id === this.state.selectedQuestionnaireTypeId);
	};

	getDefaultQuestionnaireType = () => {
		return this.state.questionnaireTypes.find(qt => qt.is_default);
	};

	getFirstQuestionnaireType = () => {
		return this.state.questionnaireTypes[0];
	};

	render(){
		if(this.state.questionnaireTypes.length === 0){
			return <Loading/>;
		}

		const selectedQuestionnaireType = this.getSelectedQuestionnaireType() || this.getDefaultQuestionnaireType() || this.getFirstQuestionnaireType();


		return (
			<div>
				<h2 className="page-header"><DashboardIcon/> Dashboard</h2>
				{ this.state.questionnaireTypes.length > 1 ?
					<ul className="nav nav-tabs nav-justified">
						{this.state.questionnaireTypes.map( qt => {
							const activeClass = selectedQuestionnaireType.id === qt.id ? "active" : "";
							return <li className={activeClass} key={qt.id} style={pointerStyle}>
								<a onClick={() => this.selectQuestionnaireType(qt)}>
									<b>{qt.name}</b>
								</a>
							</li>;
						})}
					</ul> : null
				}
				<AuditCycleTimeSeries questionnaireType={selectedQuestionnaireType}/>
				<hr/>
				<AuditCycleStorePerformance questionnaireType={selectedQuestionnaireType}/>
				<hr/>
				<DashboardCityPerformanceChart questionnaireType={selectedQuestionnaireType}/>
				<hr/>
			</div>
		);
	}
}
