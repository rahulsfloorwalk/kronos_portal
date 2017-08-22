import React, { Component } from 'react';
import { Link } from 'react-router';

import { ResponsiveContainer, PieChart, Pie, Legend, Cell, Tooltip } from 'recharts';

import moment from 'moment';
import { momentDateFormat }  from '../../config.js';

import { Tweet } from 'react-twitter-widgets';

//import { fetchUpcomingAuditStores } from '../service/audit_store.js';

import Loading from '../../js/components/Loading.jsx';
import { Time } from '../../js/components/Icons.jsx';
import { ArrowUp, ArrowDown, CircleArrowUp, CircleArrowDown } from '../../js/components/Icons.jsx';
import { getAuditType, getAuditStatus } from '../../js/utils.js';
import { LabelValue_2_10 } from '../../js/components/LabelValue.jsx';
import AuditTypeLabel from '../../js/components/AuditTypeLabel.jsx';
import AuditStoreStatusLabel from '../../js/components/AuditStoreStatusLabel.jsx';
import Jumbotron from '../../js/components/Jumbotron.jsx';

export default class TwitterFeed extends Component{
	constructor(props){
		super(props);
		this.state = {
			loading: false,
			chartData: [
				{name: "Negative", value: 18},
				{name: "Positive", value: 2},
			],
			tweets: [
				{ "type": "-1", "id": "899162150966571014",},
				{ "type": "-1", "id": "897813789587816449",},
				{ "type": "-1", "id": "896292235284692993",},
				{ "type": "-1", "id": "889404114504826881",},
				{ "type": "-1", "id": "881087172261969920",},
				{ "type": "-1", "id": "882235960091475968",},
				{ "type": "+1", "id": "864323714178891776",},
				{ "type": "-1", "id": "861072263373770752",},
				{ "type": "-1", "id": "861073285097836544",},
				{ "type": "-1", "id": "857961395647688704",},
				{ "type": "-1", "id": "855841520792076288",},
				{ "type": "-1", "id": "852831105463984128",},
				{ "type": "-1", "id": "848130639698182144",},
				{ "type": "-1", "id": "849283920285663232",},
				{ "type": "-1", "id": "848130019352117248",},
				{ "type": "+1", "id": "843784232933580800",},
				{ "type": "-1", "id": "844442222254804997",},
				{ "type": "-1", "id": "844443027808702465",},
				{ "type": "-1", "id": "839805422114504704",},
				{ "type": "-1", "id": "834691830365220864",},
			],
		};
	}

	setLoading = (loading) => {
		this.setState( prevState => {
			return Object.assign({}, prevState, {
				loading
			});
		});
	}

	componentDidMount() {
	}

	render(){
		if(this.state.loading){
			return <Loading/>;
		}
		let tweetOptions = {
			align: "center",
			wdith: "555",
		};
		if(this.state.tweets.length > 0){
			return (
				<div>
				<div className="row">
					<div className="col-md-6">
						<ResponsiveContainer width="100%" aspect={4 / 3}>
						<PieChart>
						<Pie startAngle={180} endAngle={0} data={this.state.chartData} outerRadius={120} fill="#8884d8" label={l => l.value+" tweets"}>
						<Cell fill="#BF212F"/>
						<Cell fill="#27B376"/>
						</Pie>
						<Legend wrapperStyle={{bottom: 100,}} align="center" verticalAlign="bottom"/>
						<Tooltip formatter={v => v+" tweets"}/>
						</PieChart>
						</ResponsiveContainer>
					</div>
					<div className="col-md-6">
						<table className="table">
						<tbody>
						<tr>
							<td className="text-right"><h1><big>18</big></h1></td>
							<td><h1><small>negative tweets</small></h1></td>
						</tr>
						<tr>
							<td className="text-right"><h1><big>2</big></h1></td>
							<td><h1><small>positive tweets</small></h1></td>
						</tr>
						<tr>
							<td className="text-right"><h1><big>16</big></h1></td>
							<td><h1><small>pending response</small></h1></td>
						</tr>
						<tr>
							<td className="text-right"><h1><big>4</big></h1></td>
							<td><h1><small>responded</small></h1></td>
						</tr>
						</tbody>
						</table>
					</div>
				</div>
				<hr/>
				<div className="row">
					<div className="col-md-6">
						<div className="panel panel-danger">
							<div className="panel-heading"><h4 className=""><ArrowDown/> Negative Influence</h4></div>
						</div>
							<div className="text-center form-group">
								<h2><big>14</big> <span className="text-muted">pending,</span> <big>4</big> <span className="text-muted">handled</span></h2>
							</div>
							{this.state.tweets.filter(t => t.type < 0).map( t => <Tweet key={t.id} tweetId={t.id} options={tweetOptions}/>)}
					</div>
					<div className="col-md-6">
						<div className="panel panel-success">
							<div className="panel-heading"><h4 className=""><ArrowUp/> Positive Influence</h4></div>
						</div>
							<div className="text-center form-group">
								<h2><big>2</big> <span className="text-muted">pending,</span> <big>0</big> <span className="text-muted">handled</span></h2>
							</div>
							{this.state.tweets.filter(t => t.type > 0).map( t => <Tweet key={t.id} tweetId={t.id} options={tweetOptions}/>)}
					</div>
				</div>
				</div>
			);
		} else {
			return (<Jumbotron heading="there are no upcoming audits right now" para=""/>);
		}
	}
}

