import React, { Component } from "react";
import PropTypes from "prop-types";

import Loading from "../../components/Loading.jsx";
import Jumbotron from "../../components/Jumbotron.jsx";

import QuestionnaireTrends from "./QuestionnaireTrends.jsx";
import StorePerformance from "./StorePerformance.jsx";

import { fetchStore } from "../service/store.js";
// import { fetchQuestionnaireTypes } from "../service/questionnaire_type.js";
import { fetchQuestionnaireTypesForStore } from "../service/questionnaire_type.js";

export default class StoreTrends extends Component{
	static propTypes = {
		params: PropTypes.shape({
			storeId: PropTypes.string.isRequired,
		}),
	};

	state = {};

	componentDidMount() {
		Promise.all([
			fetchStore(this.props.params.storeId),
			// fetchQuestionnaireTypes(),
			fetchQuestionnaireTypesForStore(this.props.params.storeId),
		]).then(([store, questionnaireTypes]) => {
			const firstQT = questionnaireTypes[0] || {};
			const defaultQT = questionnaireTypes.find(qt => qt.name === store.type);

			this.setState({
				store,
				questionnaireTypes,
				selectedQuestionnaireTypeId: defaultQT ? String(defaultQT.id) : String(firstQT.id),
			});
		});
	}

	selectQuestionnaireType = (e) => {
		this.setState({
			selectedQuestionnaireTypeId: e.target.value,
		});
	};

	render(){
		if(!this.state.questionnaireTypes){
			return <Loading/>;
		}

		const selectedQuestionnaireType = this.state.questionnaireTypes.find(qt => qt.id === parseInt(this.state.selectedQuestionnaireTypeId));

		return(<div>
			<h3 className="page-header">
				Store Performance
				<div className="pull-right">
					{selectedQuestionnaireType ? 
						<select className="form-control input-lg" value={this.state.selectedQuestionnaireTypeId} onChange={this.selectQuestionnaireType}>
							{this.state.questionnaireTypes.map(qt => <option key={qt.id} value={qt.id}>{qt.name}</option>)}
						</select> 
						: null
					}
					
				</div>
			</h3>
			{ selectedQuestionnaireType ?
				<div>
					<StorePerformance store_id={this.props.params.storeId} questionnaireType={selectedQuestionnaireType}/>
					<QuestionnaireTrends storeId={parseInt(this.props.params.storeId)} questionnaireType={selectedQuestionnaireType}/>
				</div>
				: <Jumbotron heading="no reports for this store" para="only completed reports graph will show up here"/>
			}
		</div>);
	}
}
