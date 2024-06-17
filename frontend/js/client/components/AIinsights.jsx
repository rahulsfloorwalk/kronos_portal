import React, { Component } from "react";
import PropTypes from "prop-types";

import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from "recharts";

// import { Tweet } from "react-twitter-widgets";

import { fetchReportSummaryClientHandles, fetchClientReportSummaryFeedByHandle } from "../service/twitter.js";

import Loading from "../../components/Loading.jsx";
import { ArrowUp, ArrowDown, Minus } from "../../components/Icons.jsx";
import Jumbotron from "../../components/Jumbotron.jsx";
import "../../../css/bs_overrides.scss";
import { Link } from "react-router";
import { hashHistory } from "react-router";
import analysispic from "../../../img/analysis_pic.jpg";

export default class AIinsights extends Component {
	static propTypes = {
		children: PropTypes.node,
	};
	constructor(props) {
		super(props);
		this.state = {
			loading: false,
			error: false,
			handles: [],
			selectedTwitterHandle: null,
		};
	}

	setLoading = (loading) => {
		this.setState(prevState => {
			return Object.assign({}, prevState, {
				loading
			});
		});
	};

	componentDidMount() {
		this.setLoading(true);
		const savedHandleId = localStorage.getItem("selectedTwitterHandle");
		fetchReportSummaryClientHandles()
			.then((handles) => {
				const defaultHandleId = handles.audit_cycle.sort((a, b) => b.id - a.id)[0].id;
				this.setState({
					selectedTwitterHandle: savedHandleId ? parseInt(savedHandleId) : defaultHandleId,
					handles: handles.audit_cycle
				});
			}).always(() => this.setLoading(false));
	}

	twitterHandleChanged = (e) => {
		this.setState({
			selectedTwitterHandle: e.target.value,
		});
		localStorage.setItem("selectedTwitterHandle", e.target.value);
	};

	render() {
		if (this.state.loading) {
			return <Loading />;
		}
		if (this.state.error) {
			return (<Jumbotron heading="Error getting Reports feeds." para="" />);
		}
		if (this.state.handles.length === 0) {
			return (<Jumbotron heading="Please Contact FloorWalk team to get this feature" para="" />);
		}
		return (
			<div>
				<select className="form-control input-lg" style={{ width: "400px", display: "inline-block" }} name="selectedTwitterHandle" value={this.state.selectedTwitterHandle} onChange={this.twitterHandleChanged}>
					{this.state.handles.length > 0 && this.state.handles
						.sort((a, b) => b.id - a.id)
						.map((h) => <option value={h.id} key={h.id}>{h.name}</option>)}
				</select>
				<hr />
				{this.state.selectedTwitterHandle &&
					<TwitterData handle={this.state.handles.length > 0 && this.state.handles.find(h => h.id === parseInt(this.state.selectedTwitterHandle))} selectedTwitterHandle={this.state.selectedTwitterHandle && this.state.selectedTwitterHandle} />
				}
				{this.props.children}
			</div>
		);
	}
}

class TwitterData extends Component {
	static propTypes = {
		handle: PropTypes.shape({
			id: PropTypes.number,
		}),
		selectedTwitterHandle: PropTypes.number,
	};

	constructor(props) {
		super(props);
		this.state = {
			loading: false,
			error: false,
			tweets: [],
			fullyLoaded: false,
			expandedSummaries: {},
			visibleNegativeSummariesCount: 2,
			visibleNeutralSummariesCount: 2,
			visiblePositiveSummariesCount: 2,
		};
	}

	setLoading = (loading) => {
		this.setState(prevState => ({
			...prevState,
			loading
		}));
	};

	componentDidMount() {
		this.fetchTweets(this.props.selectedTwitterHandle);
	}

	componentDidUpdate(prevProps) {
		if (this.props.selectedTwitterHandle !== prevProps.selectedTwitterHandle) {
			this.fetchTweets(this.props.selectedTwitterHandle);
			this.setState({
				visibleNegativeSummariesCount: 2,
				visibleNeutralSummariesCount: 2,
				visiblePositiveSummariesCount: 2,
			});
		}
	}

	fetchTweets = (selectedTwitterHandleid) => {
		this.setLoading(true);
		fetchClientReportSummaryFeedByHandle(selectedTwitterHandleid).then((tweets) => {
			this.setState({ tweets });
			this.setState({ fullyLoaded: true });
			this.setLoading(false);
		});
	};

	toggleSummaryExpansion = (key) => {
		this.setState((prevState) => ({
			expandedSummaries: {
				...prevState.expandedSummaries,
				[key]: !prevState.expandedSummaries[key]
			}
		}));
	};

	loadMoreNegativeSummaries = () => {
		this.setState(prevState => ({
			visibleNegativeSummariesCount: prevState.visibleNegativeSummariesCount + 2
		}));
	};

	loadMoreNeutralSummaries = () => {
		this.setState(prevState => ({
			visibleNeutralSummariesCount: prevState.visibleNeutralSummariesCount + 2
		}));
	};

	loadMorePositiveSummaries = () => {
		this.setState(prevState => ({
			visiblePositiveSummariesCount: prevState.visiblePositiveSummariesCount + 2
		}));
	};

	formatTimestamp = (isoTimestamp) => {
		const dateObject = new Date(isoTimestamp);
		const formattedDate = dateObject.toLocaleDateString("en-US", {
			year: "numeric",
			month: "long",
			day: "numeric",
		});
		return `${formattedDate}`;
	};

	handleView = (id) => {
		// this.props.history.push(/audit_store/${id});
		hashHistory.push(`/audit_store/${id}`);
		localStorage.setItem("selectedTwitterHandle", this.props.selectedTwitterHandle);
	};

	renderSummary = (summary, index, sentiment) => {
		const { expandedSummaries } = this.state;
		const key = `${sentiment}-${index}`;
		const isExpanded = expandedSummaries[key];
		const reportSummary = summary.report_summary;
		const truncatedSummary = reportSummary.length > 100 ? `${reportSummary.substring(0, 100)}.....  ` : reportSummary;

		return (
			<div className="ai_summary_box" key={key}>
				<div className="ai_header_box" style={{ position: "relative" }}>
					<div className="analyse_box">
						<p>{summary.audit.audit_cycle.name}</p>
						<div>
							<Link to={`/aiinsights/analysis/${summary.id}`} >
								<img src={analysispic} alt="analysis_icon" style={{ width: "50px" }} />
							</Link>
						</div>
					</div>
					<p>{summary.audit.store.name}</p>
				</div>
				<p>{isExpanded ? reportSummary : truncatedSummary} {reportSummary.length > 100 && (
					<span onClick={() => this.toggleSummaryExpansion(key)} className="ai_see">
						{isExpanded ? "See less" : "See more"}
					</span>
				)}</p>

				<p style={{ position: "relative" }}>{this.formatTimestamp(summary.audit_date)}
					<Link
						to={`/audit_store/${summary.id}`}
						style={{ padding: "4px 8px", fontSize: "1.2rem", marginLeft: "1rem", position: "absolute", right: 0 }}>View Report</Link></p>
			</div>
		);
	};

	render() {
		if (this.state.loading) {
			return <Loading />;
		}

		if (this.state.error) {
			return (<Jumbotron heading="Reports feed is not active for your account." para="" />);
		}

		const positiveTweetCount = this.state.tweets.filter(t => t.sentiment_score > 0).length;
		const neutralTweetCount = this.state.tweets.filter(t => t.sentiment_score == 0).length;
		const negativeTweetCount = this.state.tweets.filter(t => t.sentiment_score < 0).length;
		const positiveTweetSummaryArr = this.state.tweets.filter(t => t.sentiment_score > 0);
		const neutralTweetSummaryArr = this.state.tweets.filter(t => t.sentiment_score == 0);
		const negativeTweetSummaryArr = this.state.tweets.filter(t => t.sentiment_score < 0);

		const {
			visibleNegativeSummariesCount,
			visibleNeutralSummariesCount,
			visiblePositiveSummariesCount
		} = this.state;

		let chartData = [
			{ name: "Negative", value: negativeTweetCount, color: "#E54535" },
			{ name: "Positive", value: positiveTweetCount, color: "#77DD77" },
			{ name: "Neutral", value: neutralTweetCount, color: "#EFDB7C" },
		].filter(data => data.value > 0);

		return (
			<div>
				{!this.state.loading && this.state.fullyLoaded ?
					this.state.tweets && this.state.tweets.length > 0 ?
						<div>
							<div className="row">
								<div className="col-md-6">
									<ResponsiveContainer width="100%" aspect={6 / 3}>
										<PieChart>
											<Pie startAngle={360} endAngle={0} innerRadius={50} outerRadius={100} fill="#8884d8" data={chartData} label={l => l.value === 1 ? l.value + " Report" : l.value + " Reports"}>
												{chartData.map((entry, index) => (<Cell key={`cell-${index}`} fill={entry.color} />))}
											</Pie>
											<Tooltip formatter={v => v === 1 ? v + " Report" : v + " Reports"} />
										</PieChart>
									</ResponsiveContainer>
								</div>
								<div className="col-md-6">
									<table className="table">
										<tbody>
											<tr>
												<td className="text-right"><h1><big>{negativeTweetCount}</big></h1></td>
												<td><h1><small>Negative Reports</small></h1></td>
											</tr>
											<tr>
												<td className="text-right"><h1><big>{neutralTweetCount}</big></h1></td>
												<td><h1><small>Neutral Reports</small></h1></td>
											</tr>
											<tr>
												<td className="text-right"><h1><big>{positiveTweetCount}</big></h1></td>
												<td><h1><small>Positive Reports</small></h1></td>
											</tr>
										</tbody>
									</table>
								</div>
							</div>
							<hr />
							<div className="row">
								<div className="col-md-4">
									<div className="panel panel-danger">
										<div className="panel-heading"><h4 className=""><ArrowDown /> Negative Influence</h4></div>
									</div>
									<div className="text-center form-group">
										<h2><big>{negativeTweetCount}</big> <span className="text-muted">Reports</span></h2>
									</div>
									{negativeTweetSummaryArr.length > 0 ? (
										negativeTweetSummaryArr.slice(0, visibleNegativeSummariesCount).map((summary, index) => this.renderSummary(summary, index, "negative"))
									) : null}
									{visibleNegativeSummariesCount < negativeTweetSummaryArr.length && (
										<div className="ai_loadmore">
											<button onClick={this.loadMoreNegativeSummaries} className="btn btn-primary btn-md">Load More</button>
										</div>
									)}
								</div>
								<div className="col-md-4">
									<div className="panel panel-warning">
										<div className="panel-heading"><h4 className=""><Minus /> Neutral</h4></div>
									</div>
									<div className="text-center form-group">
										<h2><big>{neutralTweetCount}</big> <span className="text-muted">Reports</span></h2>
									</div>
									{neutralTweetSummaryArr.length > 0 ? (
										neutralTweetSummaryArr.slice(0, visibleNeutralSummariesCount).map((summary, index) => this.renderSummary(summary, index, "neutral"))
									) : null}
									{visibleNeutralSummariesCount < neutralTweetSummaryArr.length && (
										<div className="ai_loadmore">
											<button onClick={this.loadMoreNeutralSummaries} className="btn btn-primary btn-md">Load More</button>
										</div>
									)}
								</div>
								<div className="col-md-4">
									<div className="panel panel-success">
										<div className="panel-heading"><h4 className=""><ArrowUp /> Positive Influence</h4></div>
									</div>
									<div className="text-center form-group">
										<h2><big>{positiveTweetCount}</big> <span className="text-muted">Reports</span></h2>
									</div>
									{positiveTweetSummaryArr.length > 0 ? (
										positiveTweetSummaryArr.slice(0, visiblePositiveSummariesCount).map((summary, index) => this.renderSummary(summary, index, "positive"))
									) : null}
									{visiblePositiveSummariesCount < positiveTweetSummaryArr.length && (
										<div className="ai_loadmore">
											<button onClick={this.loadMorePositiveSummaries} className="btn btn-primary btn-md">Load More</button>
										</div>
									)}
								</div>
							</div>
						</div>
						:
						<Jumbotron heading="No Reports for this handle available" para="" />
					:
					null
				}
			</div>
		);
	}
}

