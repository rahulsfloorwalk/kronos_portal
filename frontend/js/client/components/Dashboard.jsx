import React from 'react';
import { hashHistory } from 'react-router';
import { pointerStyle } from "../../styles.js";

import LatestAuditStore from './LatestAuditStore.jsx';
import AuditCycleCityMatrix from './AuditCycleCityMatrix.jsx';
import AuditCycleTimeSeries from './AuditCycleTimeSeries.jsx';
import AuditCycleStorePerformance from './AuditCycleStorePerformance.jsx';
import DashboardCityPerformanceChart from './DashboardCityPerformanceChart.jsx';

import { Dashboard } from '../../components/Icons.jsx';

import Loading from '../../components/Loading.jsx';
import NavLink from '../../components/NavLink.jsx';
import AuditTypeLabel from '../../components/AuditTypeLabel.jsx';

import { fetchQuestionnaireTypes } from '../service/dashboard.js';

export default React.createClass({
	getInitialState: function(){
		return {
			questionnaireTypes: [],
			selectedQuestionnaireTypeId: null,
		};
	},
	componentDidMount: function(){
		fetchQuestionnaireTypes().then(questionnaireTypes => {
			this.setState({
				questionnaireTypes,
			});
		});
	},
	selectQuestionnaireType: function(questionnaireType){
		this.setState({
			selectedQuestionnaireTypeId: questionnaireType.id,
		});
	},
	getSelectedQuestionnaireType: function(){
		return this.state.questionnaireTypes.find(qt => qt.id === this.state.selectedQuestionnaireTypeId);
	},
	getDefaultQuestionnaireType: function(){
		return this.state.questionnaireTypes.find(qt => qt.is_default);
	},
	getFirstQuestionnaireType: function(){
		return this.state.questionnaireTypes[0];
	},
	render: function(){
		if(this.state.questionnaireTypes.length === 0){
			return <Loading/>;
		}

		const selectedQuestionnaireType = this.getSelectedQuestionnaireType() || this.getDefaultQuestionnaireType() || this.getFirstQuestionnaireType();


		return (
			<div>
				<h2 className="page-header"><Dashboard/> Dashboard</h2>
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
				{/*<div className="row">
					<div className="col-md-12">
						<AuditCycleCityMatrix auditType={this.props.params.auditType}/>
					</div>
				</div>*/}
			</div>
		);
	},
});
