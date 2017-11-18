import React, { Component } from 'react';
import { Link } from 'react-router';
import $ from 'jquery'

import { ResponsiveContainer, PieChart, Pie, Legend, Cell, Tooltip } from 'recharts';

import moment from 'moment';
import { momentDateFormat }  from '../../config.js';

import { Tweet } from 'react-twitter-widgets';

import { fetchUser } from '../service/user.js';
import { fetchClientTwitterFeed } from '../service/twitter.js'

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
			error: false,
			twitter_feed: [],
			selectedTwitterHandle: null,
			current_feed: []
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
		fetchClientTwitterFeed().then((twitter_feed) => {
			this.setState({
				'twitter_feed': twitter_feed,
				'selectedTwitterHandle': twitter_feed.length >  0 ? twitter_feed[0].handle : null,
			});
			if(twitter_feed.length > 0){
				this.twitterHandleChanged(twitter_feed[0].handle);
			}
		});
		this.setLoading(false);
	}

	reloadFeeds = (handle) => {
		let current_feed = this.state.twitter_feed.find( f => f.handle === handle);
		if(current_feed){
			this.setState({
				'current_feed': current_feed.data,
			});
		}
	}

	twitterHandleChanged = (handle) => {
		this.setState({
			selectedTwitterHandle: handle,
		});
		this.reloadFeeds(handle);
	}

	render(){
		if(this.state.loading){
			return <Loading/>;
		}
		if(this.state.error){
			return (<Jumbotron heading="Error getting Twitter feeds." para=""/>);
		}
		if(this.state.twitter_feed.length === 0){
			return (<Jumbotron heading="Please Contact FloorWalk team to get this feature" para=""/>);
		}

		if(this.state.twitter_feed.length > 0){
			var twitterHandles = [];
			var i = 0;
			this.state.twitter_feed.map(function(a, i){
				twitterHandles.push(<option value={a.handle} key={i}>{a.handle}</option>);
			})
			return (
				<div>
				<select className="form-control input-lg" style={{width:"400px", display:"inline-block"}} name="twitter_handle" value={this.state.selectedTwitterHandle} onChange={(e) => this.twitterHandleChanged(e.target.value)}>
					{twitterHandles}
				</select>
				<hr/>
				<TwitterData current_feed={this.state.current_feed} />
				</div>
			);
		}
	}
}

class TwitterData extends Component{
	constructor(props){
		super(props);
		this.state = {
			loading: false,
			error: false,
			current_feed: [],
		};
	}

	setLoading = (loading) => {
		this.setState( prevState => {
			return Object.assign({}, prevState, {
				loading
			});
		});
	}

	componentDidMount(){
		this.setState({
			'current_feed': this.props.current_feed
		});

	}
	componentWillReceiveProps(nextProps){
			this.setState({
				'current_feed': nextProps.current_feed
			});
	}

	render(){
		if(this.state.loading){
			return <Loading/>;
		}

		if(this.state.error){
			return (<Jumbotron heading="Twitter feed is not active for your account." para=""/>);
		}

		if(this.state.current_feed && this.state.current_feed.length === 0){
			return (<Jumbotron heading="No tweets for this handle available" para=""/>);
		}

		const positiveTweetCount = this.state.current_feed.filter(t => t.sentiment_score > 0).length;
		const neutralTweetCount = this.state.current_feed.filter(t => t.sentiment_score == 0).length;
		const negativeTweetCount = this.state.current_feed.filter(t => t.sentiment_score < 0).length;


		const positiveTweetHandled = positiveTweetCount/2;
		const positiveTweetPending = positiveTweetCount - positiveTweetHandled;
		const neutralTweetHandled = neutralTweetCount/2;
		const neutralTweetPending = neutralTweetCount - neutralTweetHandled;
		const negativeTweetHandled = negativeTweetCount/2;
		const negativeTweetPending = negativeTweetCount - negativeTweetHandled;

		const pendingCount = "", handledCount="";

		let tweetOptions = {
			align: "center",
			wdith: "555",
		};
		let chartData = [
			{ name: "Negative", value: negativeTweetCount},
			{ name: "Positive", value: positiveTweetCount},
			{ name: "Neutral", value: neutralTweetCount},
		];
		let chartData2 = [
			{ name: "Handled", value: negativeTweetHandled, handled: true},
			{ name: "Pending", value: negativeTweetPending, handled: false},
			{ name: "Handled", value: positiveTweetHandled, handled: true},
			{ name: "Pending", value: positiveTweetPending, handled: false},
			{ name: "Handled", value: neutralTweetHandled, handled: true},
			{ name: "Pending", value: neutralTweetPending, handled: false},
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
					<Cell fill="#EFDB7C"/>
					</Pie>
					<Pie startAngle={360} endAngle={0} innerRadius={120} outerRadius={140} fill="#8884d8" data={chartData2} label={l => l.value+" tweets " + (l.handled ? "handled":"pending")}>
						<Cell fill="#779ECB"/>
						<Cell fill="#EFDB7C"/>
						<Cell fill="#779ECB"/>
						<Cell fill="#EFDB7C"/>
					</Pie>
					<Tooltip formatter={v => v+" tweets"}/>
					</PieChart>
					</ResponsiveContainer>
				</div>
				<div className="col-md-6">
					<table className="table">
					<tbody>
					<tr>
						<td className="text-right"><h1><big>{negativeTweetCount}</big></h1></td>
						<td><h1><small>negative tweets</small></h1></td>
					</tr>
					<tr>
						<td className="text-right"><h1><big>{neutralTweetCount}</big></h1></td>
						<td><h1><small>neutral tweets</small></h1></td>
					</tr>
					<tr>
						<td className="text-right"><h1><big>{positiveTweetCount}</big></h1></td>
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
				<div className="col-md-4">
					<div className="panel panel-danger">
						<div className="panel-heading"><h4 className=""><ArrowDown/> Negative Influence</h4></div>
					</div>
						<div className="text-center form-group">
							<h2><big>{negativeTweetCount}</big> <span className="text-muted">Tweets</span></h2>
						</div>
						{this.state.current_feed.filter(t => t.sentiment_score < 0).map( t => <Tweet key={t.tweet_id} tweetId={t.tweet_id} options={tweetOptions}/>)}
				</div>
				<div className="col-md-4">
					<div className="panel panel-warning">
						<div className="panel-heading"><h4 className=""> Neutral</h4></div>
					</div>
						<div className="text-center form-group">
							<h2><big>{neutralTweetCount}</big> <span className="text-muted">Tweets</span></h2>
						</div>
						{this.state.current_feed.filter(t => t.sentiment_score == 0).map( t => <Tweet key={t.tweet_id} tweetId={t.tweet_id} options={tweetOptions}/>)}
				</div>
				<div className="col-md-4">
					<div className="panel panel-success">
						<div className="panel-heading"><h4 className=""><ArrowUp/> Positive Influence</h4></div>
					</div>
						<div className="text-center form-group">
							<h2><big>{positiveTweetCount}</big> <span className="text-muted">Tweets</span></h2>
						</div>
						{this.state.current_feed.filter(t => t.sentiment_score > 0).map( t => <Tweet key={t.tweet_id} tweetId={t.tweet_id} options={tweetOptions}/>)}
				</div>
			</div>
			</div>
		);
	}
}
