import React, { Component } from "react";
import { Link } from "react-router";
import $ from "jquery"

import { ResponsiveContainer, PieChart, Pie, Legend, Cell, Tooltip } from "recharts";

import moment from "moment";
import { momentDateFormat }  from "../../../config.js";

import { Tweet } from "react-twitter-widgets";

import { fetchUser } from "../service/user.js";
import { fetchClientHandles, fetchClientTwitterFeedByHandle } from "../service/twitter.js"

import Loading from "../../components/Loading.jsx";
import { Time } from "../../components/Icons.jsx";
import { ArrowUp, ArrowDown, CircleArrowUp, CircleArrowDown, Minus } from "../../components/Icons.jsx";
import { LabelValue_2_10 } from "../../components/LabelValue.jsx";
import AuditStoreStatusLabel from "../../components/AuditStoreStatusLabel.jsx";
import Jumbotron from "../../components/Jumbotron.jsx";

export default class TwitterFeed extends Component{
	constructor(props){
		super(props);
		this.state = {
			loading: false,
			error: false,
			handles: [],
			selectedTwitterHandle: null,
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
		fetchClientHandles().then((handles) => {
			this.setState({
				handles,
				selectedTwitterHandle: handles.length > 0 ? handles[0].id : null,
			});
		}).always(() => this.setLoading(false));
	}

	twitterHandleChanged = (e) => {
		this.setState({
			selectedTwitterHandle: e.target.value,
		});
	}

	render(){
		if(this.state.loading){
			return <Loading/>;
		}
		if(this.state.error){
			return (<Jumbotron heading="Error getting Twitter feeds." para=""/>);
		}
		if(this.state.handles.length === 0){
			return (<Jumbotron heading="Please Contact FloorWalk team to get this feature" para=""/>);
		}

		console.log("currently selected", this.state.handles.find(h => { console.log("h",h,h.id,this.state.selectedTwitterHandle); console.log("eqqualcheck", h.id === this.state.selectedTwitterHandle); return h.id === this.state.selectedTwitterHandle;}));
		return (
			<div>
			<select className="form-control input-lg" style={{width:"400px", display:"inline-block"}} name="selectedTwitterHandle" value={this.state.selectedTwitterHandle} onChange={this.twitterHandleChanged}>
			{ this.state.handles.map((h) => <option value={h.id} key={h.id}>{h.twitter_handle}</option>) }
			</select>
			<hr/>
			<TwitterData handle={this.state.handles.find(h => h.id === parseInt(this.state.selectedTwitterHandle))} />
			</div>
		);
	}
}

class TwitterData extends Component{
	constructor(props){
		super(props);
		this.state = {
			loading: false,
			error: false,
			tweets: [],
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
		fetchClientTwitterFeedByHandle(this.props.handle.id).then((tweets) => {
			this.setState({ tweets });
		});
	}
	componentWillReceiveProps(nextProps){
		if(nextProps.handle) {
			console.log("componentWillReceiveProps", nextProps);
			if( nextProps.handle.id !== this.props.handle.id){
				console.log("componentWillReceiveProps","nequalto", nextProps);
				fetchClientTwitterFeedByHandle(nextProps.handle.id).then((tweets) => {
					this.setState({ tweets });
				});
			}
		}
	}

	render(){
		if(this.state.loading){
			return <Loading/>;
		}

		if(this.state.error){
			return (<Jumbotron heading="Twitter feed is not active for your account." para=""/>);
		}

		if(this.state.tweets && this.state.tweets.length === 0){
			return (<Jumbotron heading="No tweets for this handle available" para=""/>);
		}

		const positiveTweetCount = this.state.tweets.filter(t => t.sentiment_score > 0).length;
		const neutralTweetCount = this.state.tweets.filter(t => t.sentiment_score == 0).length;
		const negativeTweetCount = this.state.tweets.filter(t => t.sentiment_score < 0).length;


		const positiveTweetHandled = positiveTweetCount/2;
		const positiveTweetPending = positiveTweetCount - positiveTweetHandled;
		const neutralTweetHandled = neutralTweetCount/2;
		const neutralTweetPending = neutralTweetCount - neutralTweetHandled;
		const negativeTweetHandled = negativeTweetCount/2;
		const negativeTweetPending = negativeTweetCount - negativeTweetHandled;

		const pendingCount = "", handledCount="";

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
						<TweetPager tweets={this.state.tweets.filter(t => t.sentiment_score < 0)}/>
				</div>
				<div className="col-md-4">
					<div className="panel panel-warning">
						<div className="panel-heading"><h4 className=""><Minus/> Neutral</h4></div>
					</div>
						<div className="text-center form-group">
							<h2><big>{neutralTweetCount}</big> <span className="text-muted">Tweets</span></h2>
						</div>
						<TweetPager tweets={this.state.tweets.filter(t => t.sentiment_score == 0)}/>
				</div>
				<div className="col-md-4">
					<div className="panel panel-success">
						<div className="panel-heading"><h4 className=""><ArrowUp/> Positive Influence</h4></div>
					</div>
						<div className="text-center form-group">
							<h2><big>{positiveTweetCount}</big> <span className="text-muted">Tweets</span></h2>
						</div>
						<TweetPager tweets={this.state.tweets.filter(t => t.sentiment_score > 0)}/>
				</div>
			</div>
			</div>
		);
	}
}

class TweetPager extends Component {
	constructor(props){
		super(props);
		this.state = {
			pagedUpto: 10,
		};
	}

	setInitialPageSize = (tweetLength) => {
		if(tweetLength < 10){
			this.setState({
				pagedUpto: tweetLength,
			});
		}
	}

	componentDidMount(){
		this.setInitialPageSize(this.props.tweets.length);
	}
	componentWillReceiveProps(nextProps){
		this.setInitialPageSize(nextProps.tweets.length);
	}

	tweetOptions = {
		align: "center",
		width: "555",
		conversation: "all",
		cards: "hidden",
	}

	pageNext = () => {
		this.setState({
			pagedUpto: this.state.pagedUpto + 10 > this.props.tweets.length ? this.props.tweets.length : this.state.pagedUpto + 10,
		});
	}

	render(){
		let renderedTweets = [];
		this.props.tweets.forEach((t, i) => {
			if(i < this.state.pagedUpto){
				renderedTweets.push(<Tweet key={t.tweet_id} tweetId={t.tweet_id} options={this.tweetOptions}/>);
			}
		})
		return (
			<div>
				{renderedTweets}
				{ this.state.pagedUpto !== this.props.tweets.length ?
					<button className="btn btn-primary btn-lg btn-block" onClick={this.pageNext}>View More</button>
				: null }
			</div>
		);
	}
}
