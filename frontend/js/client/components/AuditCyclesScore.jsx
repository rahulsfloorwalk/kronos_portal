import React , { Component } from "react";
import PropTypes from "prop-types";
import ReactStoreIndicator from "react-score-indicator";

import Loading from "../../components/Loading.jsx";
import Jumbotron from "../../components/Jumbotron.jsx";


class AuditCycleScoreIndicator extends Component{
	static propTypes = {
		auditCycleScoreList : PropTypes.array
	};

	render(){
		const audit_cycle_score_list = this.props.auditCycleScoreList;
		let div_class;
		if(audit_cycle_score_list.length === 1){
			div_class = "col-md-12";
		}
		else if(audit_cycle_score_list.length === 2){
			div_class = "col-md-6";
		}
		else if(audit_cycle_score_list.length === 3){
			div_class = "col-md-4";
		}
		else{
			div_class = "col-md-3";
		}

		const colors_list = ["#CD5C5C","#CD5C5C", "#FF7F50", "#FF7F50", "#808080", "#4ca9d7", "#3da940", "#3da940"];
		let score_data = [];
		for(let a of audit_cycle_score_list) {
			score_data.push(
				<div key={a.audit_cycle_name} className={div_class} style={{textAlign: "center"}}>
					<ReactStoreIndicator
						value={a.score}
						maxValue={100}
						stepsColors={colors_list}
					/>
					<h4><b>{a.audit_cycle_name}</b></h4>
				</div>
			);
		}

		return (
			<div>
				{score_data}
			</div>
		);
	}
}


class AuditCycleScoreIndicatorWrapper extends Component{
	static propTypes = {
		questionnaireType: PropTypes.shape({
			id: PropTypes.number.isRequired,
			name: PropTypes.string.isRequired,
			is_default: PropTypes.bool.isRequired,
			client_id: PropTypes.number.isRequired,
		}).isRequired,
	};

	state = {
		loading: false,
		// auditCycleScore: null,
		auditCycleScoreList: [
			{"audit_cycle_name":"April 2020", "score":85},
			{"audit_cycle_name":"May 2020", "score":95},
			{"audit_cycle_name":"June 2020", "score":60}
		]
	};

	setLoading = (loading) => {
		this.setState( prevState => {
			return Object.assign({}, prevState, {
				loading
			});
		});
	};

	// reloadData = (questionnaireTypeId) => {
	// 	if(!demo){
	// 		this.setLoading(true);
	// 		fetchCityWisePerformanceByAuditCycleId(questionnaireTypeId).then((auditCycleScoreList) => {
	// 			this.setState({
	// 				"auditCycleScoreList": auditCycleScoreList
	// 			});
	// 		}).always(() => this.setLoading(false));
	// 	}
	// };

	componentDidMount(){
		this.reloadData(this.props.questionnaireType.id);
	}

	componentWillReceiveProps(nextProps){
		if( this.props.questionnaireType !== nextProps.questionnaireType) {
			this.reloadData(nextProps.questionnaireType.id);
		}
	}

	render(){
		if(this.state.loading || ! this.state.auditCycleScoreList){
			return <Loading/>;
		}
		else if(this.state.auditCycleScoreList.length === 0){
			return (
				<div>
					<h3 className="text-center">Audit Cycle Score</h3>
					<Jumbotron heading="" para="score will be visible once reports are completed"/>
				</div>
			);
		}
		else{
			return(
				<div className="row">
					<h3 style={{textAlign: "center", marginBottom: "30px"}}>Audit Cycle Score</h3>
					<AuditCycleScoreIndicator auditCycleScoreList={this.state.auditCycleScoreList} />
				</div>
			);
		}
	}
}

export default AuditCycleScoreIndicatorWrapper;