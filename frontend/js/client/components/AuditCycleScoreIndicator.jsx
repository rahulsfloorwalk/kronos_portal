import React , { Component } from "react";
import PropTypes from "prop-types";
import ReactStoreIndicator from "react-score-indicator";

import {demo} from "../../../config.js";

import Loading from "../../components/Loading.jsx";
import Jumbotron from "../../components/Jumbotron.jsx";

import { IndicatorScoreColorsList } from "../../constants.js";
import { fetchAuditCycleScoreList } from "../service/dashboard.js";

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

		let score_data = [];
		for(let a of audit_cycle_score_list) {
			score_data.push(
				<div key={a.id} className={div_class} style={{textAlign: "center"}}>
					<ReactStoreIndicator
						value={a.get_total_percentage}
						maxValue={100}
						stepsColors={IndicatorScoreColorsList}
					/>
					<h4><b>{a.name}</b></h4>
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
		auditCycleScoreList: [],
	};

	setLoading = (loading) => {
		this.setState( prevState => {
			return Object.assign({}, prevState, {
				loading
			});
		});
	};

	reloadData = (questionnaireTypeId) => {
		if(!demo){
			this.setLoading(true);
			fetchAuditCycleScoreList(questionnaireTypeId).then((auditCycleScoreList) => {
				this.setState({
					"auditCycleScoreList": auditCycleScoreList
				});
			}).always(() => this.setLoading(false));
		}
	};

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