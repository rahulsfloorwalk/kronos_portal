import React, { Component } from "react";
import PropTypes from "prop-types";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend} from "recharts";
import { Text } from "recharts";

import { getRatingText } from "../../utils";
import Loading from "../../components/Loading.jsx";
import { fetchStorePerformance } from "../service/store.js";
import Jumbotron from "../../components/Jumbotron.jsx";

export default class StorePerformance extends Component{
	static propTypes = {
		store_id: PropTypes.oneOfType([
			PropTypes.string,
			PropTypes.number,
		]).isRequired,
		questionnaireType: PropTypes.shape({
			id: PropTypes.number.isRequired,
			name: PropTypes.string.isRequired,
			is_default: PropTypes.bool.isRequired,
			client_id: PropTypes.number.isRequired,
		}).isRequired,
	};

	state = {};

	componentDidMount(){
		if(this.props.store_id != null && this.props.questionnaireType != null){
			this.reloadData(this.props.store_id, this.props.questionnaireType.id);
		}
	}

	componentWillReceiveProps(nextProps){
		if(this.props.store_id != nextProps.store_id || this.props.questionnaireType != nextProps.questionnaireType){
			this.reloadData(nextProps.store_id, nextProps.questionnaireType.id);
		}
	}

	reloadData(store_id, questionnaireTypeId){
		fetchStorePerformance(store_id, questionnaireTypeId).then((data) =>{
			let chartData = [];
			let scoresLength = data.audit_cycle.length;
			for(let i = 0; i < scoresLength; i++){
				let percentage = Math.round((data.scores[i]*100)/data.max_marks[i]);
				chartData.push({name: data.audit_cycle[i], score: percentage, color_code: data.color_codes[i]});
			}
			this.setState({
				data: chartData
			});
		});
	}

	render(){
		if(!this.state.data){
			return <Loading/>;
		} else {
			if(this.state.data.length > 0){
				return (
					<ResponsiveContainer width="100%" aspect={3 / 1}>
						<BarChart data={this.state.data} margin={{top: 35, right: 80, left: 20, bottom: 5}}>
							<XAxis dataKey="name" label="AuditCycle"/>
							<YAxis label="Score" domain={[0,100]} tickFormatter={f => f + "%"}/>
							<Tooltip/>
							<Legend />
							<Bar dataKey="score" barSize={40} fill="#49A2CF" label={v => <Text {...v}>{v.value === null ? "N/A" : "("+getRatingText(v.color_code)+")\n"+v.value+"%"}</Text>}/>
						</BarChart>
					</ResponsiveContainer>
				);
			}
			else{
				return (<Jumbotron heading="no reports for this store" para="only completed reports graph will show up here"/>);
			}
		}
	}
}
