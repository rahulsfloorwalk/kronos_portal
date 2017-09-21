import React, { Component } from 'react';
import { Link } from 'react-router';
import $ from 'jquery'

import { ResponsiveContainer, PieChart, Pie, Legend, Cell, Tooltip } from 'recharts';

import moment from 'moment';
import { momentDateFormat }  from '../../config.js';

import { Tweet } from 'react-twitter-widgets';

import { fetchUser } from '../service/user.js';

import Loading from '../../js/components/Loading.jsx';
import { Time } from '../../js/components/Icons.jsx';
import { ArrowUp, ArrowDown, CircleArrowUp, CircleArrowDown } from '../../js/components/Icons.jsx';
import { getAuditType, getAuditStatus } from '../../js/utils.js';
import { LabelValue_2_10 } from '../../js/components/LabelValue.jsx';
import AuditTypeLabel from '../../js/components/AuditTypeLabel.jsx';
import AuditStoreStatusLabel from '../../js/components/AuditStoreStatusLabel.jsx';
import Jumbotron from '../../js/components/Jumbotron.jsx';

let fetchTweets = (clientId) => {
	return $.ajax({
		type: "GET",
		url: `https://s3-ap-southeast-1.amazonaws.com/impact-factors/tweets/${clientId}.csv`,
		dataType: "text",
	}).then((data)=>{
		return data.split("\n").map( (line, index) => {
			if(index === 0) return;
			let d = line.split(",");
			return {
				id: d[0],
				type: parseInt(d[1]),
				handled: !!parseInt(d[2]),
			};
		}).filter(i => !!i);
	});
};

export default class TwitterFeed extends Component{
	constructor(props){
		super(props);
		this.state = {
			loading: false,
			error: false,
			tweets: [],
			/*
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
			items: [],
			*/
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
		this.setLoading(true);
		fetchUser().then(user => {
			fetchTweets(user.client.id).then((tweets) =>{
				this.setState({ tweets });
			}, () => {
				this.setState({
					error: true,
				});
			}).always(()=>this.setLoading(false));
		});
	}

	render(){
		if(this.state.loading){
			return <Loading/>;
		}
		if(this.state.error){
			return (<Jumbotron heading="Twitter feed is not active for your account." para=""/>);
		}
		if(this.state.tweets.length === 0){
			return (<Jumbotron heading="there are no tweets here right now" para=""/>);
		}

		const positiveCount = this.state.tweets.filter(t => t.type >= 0).length;
		const negativeCount = this.state.tweets.length - positiveCount;

		const handledCount = this.state.tweets.filter(t => t.handled).length;
		const pendingCount = this.state.tweets.length - handledCount;

		const positiveHandled = this.state.tweets.filter(t => t.type >= 0 && t.handled).length;
		const positivePending = positiveCount - positiveHandled;

		const negativeHandled = this.state.tweets.filter(t => t.type < 0 && t.handled).length;
		const negativePending = negativeCount - negativeHandled;

		let tweetOptions = {
			align: "center",
			wdith: "555",
		};
		let chartData = [
			{ name: "Negative", value: negativeCount},
			{ name: "Positive", value: positiveCount},
		];
		let chartData2 = [
			{ name: "Handled", value: negativeHandled, handled: true},
			{ name: "Pending", value: negativePending, handled: false},
			{ name: "Handled", value: positiveHandled, handled: true},
			{ name: "Pending", value: positivePending, handled: false},
		];
		return (
			<div>
			<div className="row">
				<div className="col-md-6">
					<ResponsiveContainer width="100%" aspect={4 / 3}>
					<PieChart>
					<Pie startAngle={360} endAngle={0} innerRadius={50} outerRadius={100} fill="#8884d8" data={chartData}>
					<Cell fill="#E54535"/>
					<Cell fill="#77DD77"/>
					</Pie>
					<Pie startAngle={360} endAngle={0} innerRadius={120} outerRadius={140} fill="#8884d8" data={chartData2} label={l => l.value+" tweets " + (l.handled ? "handled":"pending")}>
						<Cell fill="#779ECB"/>
						<Cell fill="#EFDB7C"/>
						<Cell fill="#779ECB"/>
						<Cell fill="#EFDB7C"/>
					</Pie>
			{/*<Legend wrapperStyle={{bottom: 100,}} align="center" verticalAlign="bottom"/>*/}
					<Tooltip formatter={v => v+" tweets"}/>
					</PieChart>
					</ResponsiveContainer>
				</div>
				<div className="col-md-6">
					<table className="table">
					<tbody>
					<tr>
						<td className="text-right"><h1><big>{negativeCount}</big></h1></td>
						<td><h1><small>negative tweets</small></h1></td>
					</tr>
					<tr>
						<td className="text-right"><h1><big>{positiveCount}</big></h1></td>
						<td><h1><small>positive tweets</small></h1></td>
					</tr>
					<tr>
						<td className="text-right"><h1><big>{pendingCount}</big></h1></td>
						<td><h1><small>pending response</small></h1></td>
					</tr>
					<tr>
						<td className="text-right"><h1><big>{handledCount}</big></h1></td>
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
							<h2><big>{negativePending}</big> <span className="text-muted">pending,</span> <big>{negativeHandled}</big> <span className="text-muted">handled</span></h2>
						</div>
						{this.state.tweets.filter(t => t.type < 0).map( t => <Tweet key={t.id} tweetId={t.id} options={tweetOptions}/>)}
				</div>
				<div className="col-md-6">
					<div className="panel panel-success">
						<div className="panel-heading"><h4 className=""><ArrowUp/> Positive Influence</h4></div>
					</div>
						<div className="text-center form-group">
							<h2><big>{positivePending}</big> <span className="text-muted">pending,</span> <big>{positiveHandled}</big> <span className="text-muted">handled</span></h2>
						</div>
						{this.state.tweets.filter(t => t.type >= 0).map( t => <Tweet key={t.id} tweetId={t.id} options={tweetOptions}/>)}
				</div>
			</div>
			</div>
		);
	}
}

