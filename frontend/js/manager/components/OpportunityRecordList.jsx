import React from "react";
import PropTypes from "prop-types";
import { Link } from "react-router";

import moment from "moment";
import { momentDateTimeFormat}  from "../../../config.js";

import Jumbotron from "../../components/Jumbotron.jsx";
import { Plus } from "../../components/Icons.jsx";
import Loading from "../../components/Loading.jsx";

import { findOpportunityEmailRecordsByAuditCycleId, findOpportunitySMSRecordsByAuditCycleId, findOpportunityWhatsappRecordsByAuditCycleId } from "../service/opportunity_email.js";

class OpportunityRecordRow extends React.Component{
	static propTypes = {
		record: PropTypes.shape({
			progress_count: PropTypes.number,
			total_count: PropTypes.number,
			created_at: PropTypes.string,
			city: PropTypes.shape({
				name: PropTypes.string,
			}),
		}),
	};
	constructor(props){
		super(props);
		this.state = {};
	}
	render(){
		let percent = this.props.record.progress_count === this.props.record.total_count ? 100 : this.props.record.progress_count * 100 / this.props.record.total_count;
		return(
			<tr>
				<td><b>{this.props.record.city.name}</b></td>
				<td className="text-right">{moment(this.props.record.created_at).format(momentDateTimeFormat)}</td>
				<td>
					<div className="progress">
						<div className="progress-bar" role="progressbar" style={{width: percent+"%", minWidth: "3em"}}>
							<span className="sr-only">{this.props.record.progress_count}/{this.props.record.total_count}</span>
							{this.props.record.progress_count}/{this.props.record.total_count}
						</div>
					</div>
				</td>
			</tr>
		);
	}
}

export default class OpportunityRecordList extends React.Component{
	static propTypes = {
		params: PropTypes.shape({
			auditCycleId: PropTypes.number.isRequired,
		}),
		children: PropTypes.node,
	};
	constructor(props){
		super(props);
		this.state = {
			loading: false,
			records: [],
			type: "email",
			disableAddCity: false,
		};
	}

	setLoading = (loading) => {
		this.setState((oldState) => Object.assign({}, oldState, { loading }));
	};

	reloadData = (auditCycleId) => {
		this.setState({
			records: [],
			loading: true,
		});
		if(this.state.type === "email"){
			findOpportunityEmailRecordsByAuditCycleId(auditCycleId).then( records => {
				this.setState({
					records
				});
			}).always(() => this.setLoading(false));
		}
		else if(this.state.type === "sms"){
			findOpportunitySMSRecordsByAuditCycleId(auditCycleId).then( records => {
				this.setState({
					records
				});
			}).always(() => this.setLoading(false));
		}
		else if(this.state.type === "whatsapp"){
			findOpportunityWhatsappRecordsByAuditCycleId(auditCycleId).then( records => {
				this.setState({
					records
				});
			}).always(() => this.setLoading(false));
		}
	};

	componentDidMount(){
		this.reloadData(this.props.params.auditCycleId);
		this.setState({ intervalId: window.setInterval(() => this.reloadData(this.props.params.auditCycleId), 10000)});
	}

	componentWillReceiveProps(nextProps){
		this.reloadData(nextProps.params.auditCycleId);
	}

	componentWillUnmount(){
		window.clearInterval(this.state.intervalId);
	}

	onChangeHandler = (e) => {
		if(e.target.value){
			this.setState({
				type: e.target.value
			}, ()=>{
				this.reloadData(this.props.params.auditCycleId);
			});
		}
	};

	handleAddCityClick = (e) => {
		if (this.state.disableAddCity) {
			e.preventDefault();
			return;
		}

		this.setState({ disableAddCity: true });

		setTimeout(() => {
			this.setState({ disableAddCity: false });
		}, 45000);
	};

	render(){
		let rows = [];
		let para = "";
		let heading = "";
		let header = "";
		if(this.state.type === "email"){
			rows = this.state.records.map( r => (<OpportunityRecordRow record={r} key={r.id}/>));
			para = "scheduled emails for cities will appear here";
			heading = "No emails scheduled";
			header = "Opportunity Emails Scheduled";
		}
		else if(this.state.type === "sms"){
			rows = this.state.records.map( r => (<OpportunityRecordRow record={r} key={r.id}/>));
			para = "Scheduled SMS for cities will appear here";
			heading = "No SMS scheduled";
			header = "Opportunity SMS Scheduled";
		}
		else if(this.state.type === "whatsapp"){
			rows = this.state.records.map( r => (<OpportunityRecordRow record={r} key={r.id}/>));
			para = "Scheduled Whatsapp message for cities will appear here";
			heading = "No whatsapp message scheduled";
			header = "Opportunity Whatsapp Messages Scheduled";
		}

		let table = rows.length === 0 ? (
			<Jumbotron key="empty" heading={heading} para={para}/>
		) : (
			<table className="table table-striped">
				<thead>
					<tr>
						<th style={{width:"25%"}}>City</th>
						<th style={{width:"25%"}} className="text-right">Added Date</th>
						<th style={{width:"50%"}}>Progress</th>
					</tr>
				</thead>
				<tbody>
					{rows}
				</tbody>
			</table>
		);

		return(
			<div>
				<h3 className="page-header">
					<Link to={`/audit_cycle/${this.props.params.auditCycleId}/opportunity_notification/schedule`}
						onClick={this.handleAddCityClick}
						className="btn btn-default pull-right"
						style={{cursor : this.state.disableAddCity ? "not-allowed" : "pointer",opacity: this.state.disableAddCity ? 0.6 : 1,}}
						title={this.state.disableAddCity ? "Wait for 45sec" : "Add a City"}
					>
						<Plus/> Add City
					</Link>
					{/* <Link to={`/audit_cycle/${this.props.params.auditCycleId}/opportunity_notification/schedule`} className="btn btn-default pull-right">
						<Plus/> Add City
					</Link> */}
					<div className="col-md-2 pull-right">
						<select className="form-control" onChange={this.onChangeHandler}>
							<option value="email">Email</option>
							<option value="sms">SMS</option>
							<option value="whatsapp">Whatsapp</option>
						</select>
					</div>
					{header}
				</h3>
				{ this.state.loading && this.state.records.length === 0 ?  <Loading/> : table }
				{this.props.children}
			</div>
		);
	}
}
