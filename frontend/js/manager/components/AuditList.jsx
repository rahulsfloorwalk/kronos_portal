import React, { Component } from "react";
import PropTypes from "prop-types";
import * as ReactRedux from "react-redux";
import { hashHistory, Link } from "react-router";

import Alert from "react-s-alert";

import { CSSTransitionGroup } from "react-transition-group";

import moment from "moment";
import { momentDateFormat }  from "../../../config.js";

import { pointerStyle }  from "../../styles.js";

import { Rook, Duplicate, Cross, HandRight, Pencil, Plus, Inbox, ThumbsDown, File, EyeClose, EyeOpen, OptionVertical,Envelope,Phone } from "../../components/Icons.jsx";
import Loading from "../../components/Loading.jsx";
import DropDown, { DropDownDivider } from "../../components/DropDown.jsx";

import MarkdownViewer from "../../components/MarkdownViewer.jsx";

import ApplicationStatusSummary from "./application/ApplicationStatusSummary.jsx";

import { AuditStoreTable } from "./AuditStoreList.jsx";

import {fetchAudits, deleteAudit, hideAudit, unhideAudit} from "../actions/audit.js";

import { rejectAllForAudit, rejectAllForAuditCycle,notificationEmailSendForPincode,notificationWhatsappSendForPincode,notificationAllEmailSendForPincode,notificationAllWhatsappSendForPincode } from "../service/application.js";
import { findAuditStoresByAudit } from "../service/audit_store.js";
import { findModerators } from "../service/moderator.js";

import { findAuditsByAuditCycleId } from "../selectors/audit";

import AuditApplicationList from "./application/AuditApplicationList.jsx";
import AgencyListForAudit from "./audit/AgencyListForAudit.jsx";

import { auditPropType } from "../prop_types";

class AuditStoreTableForAudit extends Component{
	static propTypes = {
		auditId: PropTypes.number.isRequired,
	};

	constructor(props){
		super(props);
		this.state = {
			auditStores: [],
			loading: false,
			moderators: [],
			isEmailNotificationDisabled:false,
			isWhatsappNotificationDisabled:false,
		};
	}

	setLoading = (loading) => {
		this.setState(prevState => Object.assign({}, prevState, { loading }));
	};

	componentDidMount(){
		this.setLoading(true);
		findAuditStoresByAudit(this.props.auditId).then((auditStores) => {
			this.setState({auditStores});
		}).always(()=>this.setLoading(false));

		findModerators().then((moderators) => {
			this.setState({ moderators });
		});
	}
	auditStoreUpdated = (auditStore) => {
		let i = this.state.auditStores.findIndex(as => as.id === auditStore.id);
		if( i !== -1){
			let auditStores = this.state.auditStores;
			auditStores[i] = auditStore;
			this.setState({
				auditStores: auditStores,
			});
		}
	};

	render(){
		if(this.state.loading) {
			return <Loading/>;
		} else {
			return (<AuditStoreTable auditStores={this.state.auditStores} moderators={this.state.moderators} onUpdate={this.auditStoreUpdated}/>);
		}
	}
}

export class __AuditRow extends Component{
	static propTypes = {
		audit: PropTypes.object,

		auditCycleId: PropTypes.oneOfType([
			PropTypes.number,
			PropTypes.string,
		]).isRequired,
		serial: PropTypes.number.isRequired,
		showAuditDate: PropTypes.bool,
		showAuditFees: PropTypes.bool,
		showReimbursement: PropTypes.bool,
		showPriority: PropTypes.bool,

		onDelete: PropTypes.func.isRequired,

		dispatch: PropTypes.func.isRequired,
	};

	constructor(props){
		super(props);
		this.state = {
			expanded: false,
			selectedTab: "applications",
		};
	}

	viewButtonClicked = (e) => {
		e.preventDefault();
		this.setState({
			expanded: !this.state.expanded
		});
	};

	rejectAllForAuditClicked = (e) => {
		e.stopPropagation();
		if(confirm("Are you sure you want to deny all applications for this audit?")){
			rejectAllForAudit(this.props.audit.id).done((count)=>{
				Alert.success(`${count} APPLICATIONS DENIED`);
				hashHistory.push(`/audit_cycle/${this.props.auditCycleId}/audit`);
			});
		}
	};

	hideAuditClicked = (e) => {
		e.stopPropagation();
		this.props.dispatch(hideAudit(this.props.audit.id)).then(() => Alert.success("AUDIT HIDDEN"));
	};

	unhideAuditClicked = (e) => {
		e.stopPropagation();
		this.props.dispatch(unhideAudit(this.props.audit.id)).then(() => Alert.success("AUDIT VISIBLE"));
	};
	sendEmailNotification=(auditCycleId,auditId)=>{
		notificationEmailSendForPincode(auditCycleId, auditId).then(() => {
			Alert.success("NOTIFICATION SCHEDULED");
		}).fail((err)=>{
			let error=err.responseJSON.non_field_errors;
			Alert.error(error);
		});
	};
	sendWhatsappNotification=(auditCycleId,auditId)=>{
		notificationWhatsappSendForPincode(auditCycleId, auditId).then(() => {
			Alert.success("NOTIFICATION SCHEDULED");
		}).fail((err)=>{
			let error=err.responseJSON.non_field_errors;
			Alert.error(error);
		});
	};
	render(){
		let reportCount = this.props.audit.report_count;
		let validReportCount = this.props.audit.valid_report_count;

		let expandedBorder = {
			borderLeft: "solid Black 1px",
			//borderRight: "solid Black 1px",
		};

		let backgroundColor;
		if( validReportCount === 0){
			backgroundColor = "";
		}
		else if( validReportCount >= this.props.audit.count){
			backgroundColor = "#DFF0D8";
		} else if(validReportCount < this.props.audit.count){
			backgroundColor = "#FCF8E3";
		}

		let trStyle = Object.assign({}, pointerStyle, {
			backgroundColor
		}, this.state.expanded ? expandedBorder : {},
		this.state.expanded ? { fontSize : "130%", fontWeight: "bold", } : {},
		this.props.audit.count === 0 ? { opacity : "0.3" } : {},
		);

		let currentTab;

		switch(this.state.selectedTab){
		case "applications":
			currentTab = <AuditApplicationList auditId={this.props.audit.id}/>;
			break;
		case "reports":
			currentTab = <AuditStoreTableForAudit auditId={this.props.audit.id}/>;
			break;
		case "agencies":
			currentTab = <AgencyListForAudit auditId={this.props.audit.id}/>;
			break;
		}

		return(
			<tbody>
				<tr style={trStyle} onClick={this.viewButtonClicked} title={this.state.expanded ? "Click to Collapse" : "Click to Expand"} className={this.state.expanded ? "active" : ""}>
					<td className="text-right">{this.props.serial}</td>
					<td>
						{this.props.audit.store.name} {this.props.audit.store.code && " - "+this.props.audit.store.code}
						<br/>
						<small className="text-muted">{this.props.audit.store.address}</small>
					</td>
					{ this.props.showPriority ? <td className="text-right">{this.props.audit.store.priority}</td> : null }
					{ this.props.showAuditDate ? <td className="text-right">{moment(this.props.audit.audit_date).isValid() ? moment(this.props.audit.audit_date).format(momentDateFormat) : null}</td> : null }
					<td>{this.props.audit.store.city.name}</td>
					{ this.props.showAuditFees ? <td className="text-right">{this.props.audit.earnings_per_audit}</td> : null }
					{ this.props.showReimbursement ? <td className="text-right">{this.props.audit.reimbursement ? this.props.audit.reimbursement : null}</td> : null }
					<td className="text-right">{this.props.audit.count}</td>
					<td className="text-right">{this.props.audit.application_count}</td>
					<td className="text-right">{validReportCount} ( {reportCount})</td>
					<td className="text-right"><big>{ this.props.audit.hidden ? <EyeClose/> : <EyeOpen/>}</big></td>
					<td className="text-right">
						<div className="btn-group pull-right">
							<button type="button" className="btn btn-default"
								onClick={(e)=>{e.stopPropagation(); this.auditRowDropDown && this.auditRowDropDown.toggle();}}>
								<OptionVertical/>
							</button>
							<DropDown ref={(d) => this.auditRowDropDown=d}>
								<li>
									<Link to={`/audit_cycle/${this.props.auditCycleId}/audit/${this.props.audit.id}/application/fiat`} title="Fiat Assign">
										<HandRight/> Fiat Assign
									</Link>
								</li>
								{
									(!this.props.audit.hidden && (this.props.audit.audit_cycle.status==="ACTIVE" || this.props.audit.audit_cycle.status==="UPCOMING" ) ) ?
									<>
										<li>
											<a onClick={()=>this.sendEmailNotification(this.props.auditCycleId,this.props.audit.id)}>
												<Envelope/> Email Notification
											</a>
										</li>
										<li>
											<a onClick={()=>this.sendWhatsappNotification(this.props.auditCycleId,this.props.audit.id)}>
												<Phone/> Whatsapp Notification
											</a>
										</li>
									</>
										: null
								}
								{this.props.audit.hidden ?
									<li>
										<a style={pointerStyle} onClick={this.unhideAuditClicked}>
											<EyeOpen/> Unhide
										</a>
									</li>
									:
									<li>
										<a style={pointerStyle} onClick={this.hideAuditClicked}>
											<EyeClose/> Hide
										</a>
									</li>
								}
								<li>
									<a style={pointerStyle} onClick={this.rejectAllForAuditClicked}>
										<ThumbsDown/> Deny All Applications
									</a>
								</li>
								<DropDownDivider/>
								<li>
									<Link to={`/audit_cycle/${this.props.auditCycleId}/audit/${this.props.audit.id}/edit`} title="Edit Audit">
										<Pencil/> Edit
									</Link>
								</li>
								<li>
									<a onClick={this.props.onDelete ? (e) => { e.stopPropagation(); this.props.onDelete(this.props.audit);} : ()=>{} } title="Delete Audit">
										<Cross/> Delete
									</a>
								</li>
							</DropDown>
							{/*<button type="button" className="btn btn-default" onClick={this.viewButtonClicked} title="Expand Applications">
							    View
						    </button>
							    {/*this.state.expanded ? <ChevronDown/> : <ChevronRight/>*/}
						</div>
					</td>
				</tr>
				{ this.props.audit.post_approval_description ?
					<CSSTransitionGroup
						component="tr"
						transitionName="fade"
						style={expandedBorder}
						transitionEnterTimeout={300}
						transitionLeaveTimeout={300}>
						{ this.state.expanded ?
							<td colSpan="11" style={{backgroundColor: "White"}}>
								<MarkdownViewer markdown={this.props.audit.post_approval_description}/>
							</td>
							: null }
					</CSSTransitionGroup>
					: null }
				<CSSTransitionGroup
					component="tr"
					transitionName="fade"
					style={expandedBorder}
					transitionEnterTimeout={300}
					transitionLeaveTimeout={300}>
					{ this.state.expanded ?
						<td colSpan="11" style={{backgroundColor: "White"}}>
							<ul className="nav nav-tabs">
								<li className={this.state.selectedTab === "applications" ? "active" : ""} style={pointerStyle} role="presentation">
									<a onClick={() => this.setState({selectedTab:"applications"})}><Inbox/> Applications</a>
								</li>
								<li className={this.state.selectedTab === "agencies" ? "active" : ""} style={pointerStyle} role="presentation">
									<a onClick={() => this.setState({selectedTab:"agencies"})}><Rook/> Agencies</a>
								</li>
								<li className={this.state.selectedTab === "reports" ? "active" : ""} style={pointerStyle} role="presentation">
									<a onClick={() => this.setState({selectedTab:"reports"})}><File/> Reports</a>
								</li>
							</ul>
							<CSSTransitionGroup
								transitionName="fade"
								transitionEnterTimeout={300}
								transitionLeaveTimeout={300}>
								{currentTab}
							</CSSTransitionGroup>
						</td>
						: null }
				</CSSTransitionGroup>
			</tbody>
		);
	}
}

const AuditRow = ReactRedux.connect()(__AuditRow);

export class AuditList extends Component{
	static propTypes = {
		params: PropTypes.object,
		audits: PropTypes.arrayOf(auditPropType).isRequired,

		children: PropTypes.node,
		dispatch: PropTypes.func.isRequired,
	};

	constructor(props){
		super(props);
		this.state = {
			loading: true,
			selectedCityId: null,
			selectedHiddenState: "",
			selectedAuditDate: "",
			selectedPriority: "",
		};
	}

	setLoading = (loading) => {
		this.setState(prevState => Object.assign({}, prevState, {loading}));
	};

	componentDidMount(){
		this.setLoading(true);
		this.props.dispatch(fetchAudits(this.props.params.auditCycleId)).always(()=>this.setLoading(false));
	}

	onDelete = (audit) => {
		this.props.dispatch(deleteAudit(audit.id)).then(()=>{
			Alert.success("AUDIT DELETED");
		}, ()=> {
			Alert.warning("AUDIT CANNOT BE DELETED");
		});
	};

	onCityChanged = (e) => {
		this.setState({selectedCityId: e.target.value});
	};

	onHiddenFilterChanged = (e) => {
		this.setState({selectedHiddenState: e.target.value});
	};
	onStatuaFilterChanged = (e) => {
		this.setState({selectedStatuaState: e.target.value});
	};

	onPriorityFilterChanged = (e) => {
		this.setState({selectedPriority: e.target.value});
	};

	onAuditDateChanged = (e) => {
		this.setState({selectedAuditDate: e.target.value});
	};

	cityComparator = (a,b) => {
		if(a.name < b.name) return -1;
		if(a.name > b.name) return 1;
		return 0;
	};

	dateComparator = (a,b) => {
		const aDate = moment(a), bDate = moment(b);
		if(!aDate.isValid()) return -1;
		if(aDate.isBefore(bDate)) return -1;
		if(aDate.isAfter(bDate)) return 1;
		return 0;
	};


	sendAllEmailNotification=(auditCycleId)=>{
		this.setState({ isEmailNotificationDisabled:true});
		notificationAllEmailSendForPincode(auditCycleId).done(() => {
			Alert.success("NOTIFICATION SCHEDULED");
		}).fail((err)=>{
			let error=err.responseJSON.non_field_errors;
			Alert.error(error);
		}).always(()=>{
			setTimeout(()=>{
				this.setState({
					isEmailNotificationDisabled:false
				});
			}, 10*60*1000);
		});
	};
	sendAllWhatsappNotification=(auditCycleId)=>{
		this.setState({ isWhatsappNotificationDisabled:true});
		notificationAllWhatsappSendForPincode(auditCycleId).done(() => {
			Alert.success("NOTIFICATION SCHEDULED");
		}).fail((err)=>{
			let error=err.responseJSON.non_field_errors;
			Alert.error(error);
		}).always(()=>{
			setTimeout(()=>{
				this.setState({
					isWhatsappNotificationDisabled:false
				});
			},10*60*1000);
		});
	};

	rejectAllForAuditCycleClicked = () => {
		if(confirm("Are you sure you want to deny all applications for this audit cycle?")){
			rejectAllForAuditCycle(this.props.params.auditCycleId).done((count)=>{
				Alert.success(`${count} APPLICATIONS DENIED`);
				hashHistory.push(`/audit_cycle/${this.props.params.auditCycleId}/audit`);
			});
		}
	};

	render(){
		if(this.state.loading){
			return <Loading/>;
		}

		let cities = Object.keys(this.props.audits).reduce( (p, id) => {
			if(! p.find( c => c.id === this.props.audits[id].store.city.id)){
				return p.concat(this.props.audits[id].store.city);
			} else {
				return p;
			}
		}, []).sort(this.cityComparator);

		let auditDates = Object.keys(this.props.audits).reduce((dates, id) => {
			if(dates.find( d => d === this.props.audits[id].audit_date) === undefined){
				return dates.concat(this.props.audits[id].audit_date);
			} else {
				return dates;
			}
		}, []).sort(this.dateComparator);

		const priorities = Object.keys(this.props.audits).reduce((priorities, id) => {
			if(priorities.find( p => p === this.props.audits[id].store.priority) === undefined){
				return priorities.concat(this.props.audits[id].store.priority);
			} else {
				return priorities;
			}
		}, []).sort();

		let showAuditFees = false, showReimbursement = false, showAuditDate = false, showPriority = false;

		for(let id in this.props.audits){
			if(this.props.audits[id].earnings_per_audit){
				showAuditFees = true;
			}
			if(this.props.audits[id].reimbursement){
				showReimbursement = true;
			}
			if(this.props.audits[id].audit_date){
				showAuditDate = true;
			}
			if(this.props.audits[id].store.priority){
				showPriority = true;
			}
		}

		let serial = 1;
		let rows = Object.values(this.props.audits)
			.sort((a,b) => this.cityComparator(a.store.city, b.store.city))
			.filter((a) => {
				switch(this.state.selectedAuditDate){
				case "":
					return true;
				case "null":
					return a.audit_date === null;
				default:
					return a.audit_date == this.state.selectedAuditDate;
				}
			})
			.filter((a) => this.state.selectedCityId ? a.store.city.id === parseInt(this.state.selectedCityId) : true)
			.filter((a) => this.state.selectedPriority ? a.store.priority === this.state.selectedPriority : true)
			.filter((a) => this.state.selectedHiddenState !== "" ? "true" === this.state.selectedHiddenState === a.hidden : true)
			.filter((a) => {
				switch (this.state.selectedStatuaState) {
				case "":
					return true;
				case "true":
					return a.valid_report_count < a.count;
				case "false":
					return a.valid_report_count >= a.count;
				default:
					return true;
				}
			})
			.map( a => <AuditRow key={a.id}
				showAuditDate={showAuditDate}
				showAuditFees={showAuditFees}
				showReimbursement={showReimbursement}
				showPriority={showPriority}
				serial={serial++}
				auditCycleId={this.props.params.auditCycleId}
				audit={a}
				onDelete={this.onDelete}
			/>);

		var addAuditLink = `/audit_cycle/${this.props.params.auditCycleId}/audit/add`;
		return(<div>
			<h3 className="page-header">
				<div className="btn-group pull-right">
					<Link to={addAuditLink} className="btn btn-default"> <Plus/> Add Audit </Link>
					<button type="button" className="btn btn-default m-2"
						onClick={(e)=>{e.stopPropagation(); this.auditDropDown && this.auditDropDown.toggle();}}>
						<span className="caret"></span>
					</button>
					<DropDown ref={(d) => this.auditDropDown=d}>
						<li>
							<Link to={`/audit_cycle/${this.props.params.auditCycleId}/audit/copy`} title="Copy Audits">
								<Duplicate/> Copy Audits
							</Link>
						</li>
						<li>
							<a style={pointerStyle} onClick={this.rejectAllForAuditCycleClicked}>
								<ThumbsDown/> Deny All Applications
							</a>
						</li>
					</DropDown>

				</div>
				<Inbox/> Audits
				{this.props.audits.length > 0 && (
					this.props.audits[0].audit_cycle.status === "UPCOMING" ||
					this.props.audits[0].audit_cycle.status === "ACTIVE"
				)
					?
					<div className="pull-right">
						<button type="button" className="btn btn-success" disabled={this.state.isWhatsappNotificationDisabled} onClick={()=>this.sendAllWhatsappNotification(this.props.params.auditCycleId)} >All Whatsapp Notification</button>&nbsp;&nbsp;
						<button type="button" className="btn btn-primary" disabled={this.state.isEmailNotificationDisabled} onClick={()=>this.sendAllEmailNotification(this.props.params.auditCycleId)}>All Email Notification</button>&nbsp;&nbsp;
					</div>
					: null
				}
			</h3>
			<ApplicationStatusSummary auditCycleId={this.props.params.auditCycleId}/>
			<div className="table-responsive">
				<table className="table table-hover">
					<thead>
						<tr>
							<th className="text-right">#</th>
							<th>Store</th>
							{ showPriority ? <th>
								<select value={this.state.selectedPriority} onChange={this.onPriorityFilterChanged} className="form-control">
									<option value="">Priority</option>
									{priorities.map((p, i) => <option key={i} value={p}>{p}</option>)}
								</select>
							</th> : null }
							{ showAuditDate ? <th>
								<select value={this.state.selectedAuditDate} onChange={this.onAuditDateChanged} className="form-control">
									<option value="">Audit Date</option>
									{auditDates.map((ad, i) => <option key={i} value={ad === null ? "null" : ad}>{moment(ad).isValid() ? moment(ad).format(momentDateFormat) : "No Date"}</option>)}
								</select>
							</th> : null }
							<th>
								<select value={this.state.selectedCity} onChange={this.onCityChanged} className="form-control">
									<option value="">City</option>
									{cities.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
								</select>
							</th>
							{ showAuditFees ? <th className="text-right">Fees (₹)</th> : null }
							{ showReimbursement ? <th className="text-right">Reimbursement (₹)</th> : null }
							<th className="text-right">Audit Count</th>
							<th className="text-right">Applications</th>
							<th className="text-right">Reports</th>
							<th className="text-right">
								<select onChange={this.onHiddenFilterChanged} className="form-control">
									<option value="">All</option>
									<option value="true">Hidden</option>
									<option value="false">Visible</option>
								</select>
							</th>
							<th className="text-right">
								<select onChange={this.onStatuaFilterChanged} className="form-control">
									<option value="">All</option>
									<option value="true">Pending</option>
									<option value="false">Completed</option>
								</select>
							</th>
							<th>&nbsp;</th>
						</tr>
					</thead>
					{rows}
				</table>
			</div>
			{this.props.children}
		</div>);
	}
}

const mapAuditToProps = (store, ownProps) => {
	const auditCycleId = parseInt(ownProps.params.auditCycleId);
	return {
		audits: findAuditsByAuditCycleId(store, auditCycleId),
	};
};

export default ReactRedux.connect(mapAuditToProps)(AuditList);
