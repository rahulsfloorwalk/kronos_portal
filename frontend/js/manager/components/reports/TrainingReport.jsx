import React, { Component } from "react";
import { Link } from "react-router";
import PropTypes from "prop-types";
import moment from "moment";

import { affectInputEventToComponent } from "../../../react_utils.js";
import AuditStoreStatusLabel from "../../../components/AuditStoreStatusLabel.jsx";
import Loading from "../../../components/Loading.jsx";
import { Cross } from "../../../components/Icons.jsx";
import { getAuditStoreStatus } from "../../../utils.js";
import { momentDateFormat, momentDateTimeFormat1 }  from "../../../../config.js";

import Alert from "react-s-alert";
import Datetime from "react-datetime";
import "react-datetime/css/react-datetime.css";

import { setFollowUpByAuditStore } from "../../service/audit_store.js";
import { fetchDashboardAuditCyclesByClient } from "../../service/audit_cycle.js";
import { getFollowUpReport } from "../../service/reports.js";
import { fetchClientsWithDashboardCycleStatus } from "../../service/client.js";
import { fetchAudits } from "../../service/audit.js";

export class TrainingReportRow extends Component{
	static propTypes = {
		store: PropTypes.shape({
			id: PropTypes.number.isRequired,
			name: PropTypes.string.isRequired,
		}),
		auditStore: PropTypes.shape({
			id: PropTypes.number.isRequired,
			audit_date: PropTypes.string.isRequired,
			status: PropTypes.string.isRequired,
		}),
		auditor: PropTypes.shape({
			id: PropTypes.number.isRequired,
			name: PropTypes.string.isRequired,
			mobile_number: PropTypes.string.isRequired,
		}),
		follow_up: PropTypes.shape({
			comment: PropTypes.string,
			user: PropTypes.string,
			next_follow_up_date: PropTypes.string,
		})
	};

	constructor(props){
		super(props);
		this.state = {
			isEditable: false,
			comment: props.follow_up.comment,
			next_follow_up_date: props.follow_up.next_follow_up_date,
			manager: props.follow_up.user
		};
	}

	inputChanged = (e) => {
		affectInputEventToComponent(e, this);
	};

	dateChanged = (date) => {
		if( typeof date !== "string"){
			this.setState({
				next_follow_up_date: date
			});
		}
	};

	onSubmit = () => {
		if(this.state.comment == ""){
			Alert.warning("Please enter a comment");
		}
		else{
			setFollowUpByAuditStore(this.props.auditStore.id, this.state.comment, this.state.next_follow_up_date).then((follow_up)=>{
				Alert.success("FOLLOWUP SAVED");
				this.setState({
					isEditable: false,
					comment: follow_up.comment,
					next_follow_up_date: follow_up.next_follow_up_date,
					manager: follow_up.user_actor.email
				});
			});
		}
	};

	render(){
		let {store, auditStore, auditor} = this.props;
		return(
			<tr key={auditStore.id}>
				<td className="text-center"><Link to={`/audit_store/${auditStore.id}/report`} target="_blank">{store.name}</Link></td>
				<td className="text-center"><AuditStoreStatusLabel status={auditStore.status}/></td>
				<td className="text-center"><Link to={`/auditor/${auditor.id}/details`} target="_blank">{auditor.name}<br/>{auditor.mobile_number}</Link></td>
				<td className="text-center">{moment(auditStore.audit_date).format(momentDateFormat)}</td>
				<td className="text-center">{this.state.manager}</td>
				<td>
					{this.state.isEditable ?
						<textarea defaultValue={this.state.comment} name="comment" className="form-control" onChange={this.inputChanged}></textarea>
						: this.state.comment }
				</td>
				<td className="text-center">
					{this.state.isEditable ? <Datetime onChange={this.dateChanged} value={this.state.next_follow_up_date ? moment(this.state.next_follow_up_date) : null}/> : null}

					{this.state.next_follow_up_date && !this.state.isEditable ? moment(this.state.next_follow_up_date).format(momentDateTimeFormat1) : null}
				</td>
				<td className="text-center">
					{this.state.isEditable ? <span><button className="btn btn-primary" onClick={this.onSubmit}>Update</button> <button className="btn btn-default" onClick={()=>this.setState({isEditable:!this.state.isEditable})}><Cross/></button></span> : null}
					{this.state.isEditable == false ? <button className="btn btn-primary" onClick={()=>this.setState({isEditable:!this.state.isEditable})}>Edit</button> : null}
				</td>
			</tr>
		);
	}
}

export default class TrainingReport extends Component{
	constructor(props){
		super(props);
		this.state = {
			reports: [],
			clients: [],
			audit_cycles: [],
			stores: [],
			client: "",
			cycle: "",
			store: "",
			audit_status: "",
			followup_date: "",
			filter_error: "",
			loading: false
		};
	}

	componentDidMount(){
		fetchClientsWithDashboardCycleStatus().done((clients)=>this.setState({clients}));
	}

	reload_data = (client, cycle, store, audit_status, followup_date) => {
		this.setLoading(true);
		getFollowUpReport(client, cycle, store, audit_status, followup_date).then((reports)=> this.setState({
			reports: reports,
			loading: false
		}));
	};

	setLoading = (loading) => {
		this.setState(prevState => Object.assign({}, prevState, {loading}));
	};

	inputChanged = (e) => {
		affectInputEventToComponent(e, this);
	};

	client_changed = (e) => {
		this.inputChanged(e);
		if(e.target.value != ""){
			fetchDashboardAuditCyclesByClient(e.target.value).then((audit_cycles)=>this.setState({audit_cycles}));
		}
	};

	audit_cycle_changed = (e) => {
		this.inputChanged(e);
		if(e.target.value != ""){
			fetchAudits(e.target.value).then((stores)=>this.setState({stores}));
		}
	};

	dateChanged = (date) => {
		if( typeof date !== "string"){
			this.setState({
				followup_date: date.format("YYYY-MM-DD")
			});
		}
		else{
			this.setState({
				followup_date: ""
			});
		}
	};

	findFilter = () => {
		if(this.state.client == "" || this.state.cycle == ""){
			this.setState({filter_error: "Please select valid filters"});
		}
		else{
			this.setState({filter_error: ""});
			this.reload_data(this.state.client, this.state.cycle, this.state.store, this.state.audit_status, this.state.followup_date);
		}
	};

	resetFilter = () =>{
		this.setState({
			client: "",
			cycle: "",
			store: "",
			audit_status: "",
			followup_date: "",
		});
	};

	render(){
		let clients = this.state.clients.sort((a, b) => a.name.toLowerCase() > b.name.toLowerCase() ? 1 : -1);
		let audit_cycle = this.state.audit_cycles.sort((a, b) => a.name.toLowerCase() > b.name.toLowerCase() ? 1 : -1);
		let stores = this.state.stores.sort((a, b) => a.store.name.toLowerCase() > b.store.name.toLowerCase() ? 1 : -1);

		const client_option_list = clients.map((m,i) => <option key={i} value={m.id}>{m.name}</option>);
		const cycle_option_list = audit_cycle.map((m,i) => <option key={i} value={m.id}>{m.name}</option>);
		const stores_option_list = stores.map((m,i) => <option key={i} value={m.id}>{m.store.name}</option>);

		let report_blocks = this.state.reports.map((value) => {
			return (
				<TrainingReportRow
					key={value.auditStore.id}
					store={value.store}
					auditStore={value.auditStore}
					auditor={value.user}
					follow_up={value.follow_up}
				/>
			);
		});
		return (
			<div>
				<h2>Follow-up report</h2><br/>
				<div className="row">
					<div className="col-md-2" style={{marginBottom: "10px"}}>
						<select className="form-control" value={this.state.client} name="client" onChange={this.client_changed}>
							<option value="">Select Client</option>
							{client_option_list}
						</select>
					</div>
					<div className="col-md-2" style={{marginBottom: "10px"}}>
						<select className="form-control" value={this.state.cycle} name="cycle" onChange={this.audit_cycle_changed}>
							<option value="">Select Cycle</option>
							{cycle_option_list}
						</select>
					</div>
					<div className="col-md-2" style={{marginBottom: "10px"}}>
						<select className="form-control" value={this.state.store} name="store" onChange={this.inputChanged}>
							<option value="">Select Center</option>
							{stores_option_list}
						</select>
					</div>
					<div className="col-md-2" style={{marginBottom: "10px"}}>
						<select className="form-control" name="audit_status" value={this.state.audit_status} onChange={this.inputChanged}>
							<option value="">Select Audit Status</option>
							<option value="ASSIGNED">{getAuditStoreStatus("ASSIGNED")}</option>
							<option value="ACKNOWLEDGED">{getAuditStoreStatus("ACKNOWLEDGED")}</option>
							<option value="SUBMITTED">{getAuditStoreStatus("SUBMITTED")}</option>
							<option value="PM_REVIEW">{getAuditStoreStatus("PM_REVIEW")}</option>
							<option value="WITHDRAWN">{getAuditStoreStatus("WITHDRAWN")}</option>
							<option value="AUDITOR_WITHDRAWN">{getAuditStoreStatus("AUDITOR_WITHDRAWN")}</option>
							<option value="COMPLETED">{getAuditStoreStatus("COMPLETED")}</option>
							<option value="FAILED">{getAuditStoreStatus("FAILED")}</option>
							<option value="ACCEPTED">{getAuditStoreStatus("ACCEPTED")}</option>
							<option value="REJECTED">{getAuditStoreStatus("REJECTED")}</option>
						</select>
					</div>
					<div className="col-md-2" style={{marginBottom: "10px"}}>
						<Datetime
							inputProps={{placeholder:"Select follow up date"}}
							name="followup_date"
							timeFormat={false}
							dateFormat="YYYY-MM-DD"
							closeOnSelect={true}
							onChange={this.dateChanged}
						/>
					</div>
					<div className="col-md-2">
						<button className="btn btn-primary" onClick={this.findFilter}>Search</button>&nbsp;&nbsp;
						<button className="btn btn-primary" onClick={this.resetFilter}>Reset</button>
					</div>
				</div>
				<p className="text-danger"><b>{this.state.filter_error}</b></p>
				<br/>
				<div className="row col-md-12">
					{this.state.loading ? <Loading/> : report_blocks.length > 0 ?
						<div className="table-responsive">
							<table className="table table-hover table-striped table-bordered table-condensed">
								<thead>
									<tr>
										<th className="text-center">
											Center name
										</th>
										<th className="text-center">
											Audit Status
										</th>
										<th className="text-center">Auditor Assigned</th>
										<th className="text-center">Audit Date</th>
										<th className="text-center">Edited by</th>
										<th className="text-center">Comment</th>
										<th className="text-center">Follow-up</th>
										<th className="text-center">Action</th>
									</tr>
								</thead>
								<tbody>
									{report_blocks}
								</tbody>
							</table>
						</div>
						:
						<div className="jumbotron text-center">
							<h2>no results found</h2>
							<p>try modifying your search terms a bit..</p>
						</div>
					}
				</div>
			</div>
		);
	}
}