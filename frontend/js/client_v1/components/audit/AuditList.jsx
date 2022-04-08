import React, { Component } from "react";
import PropTypes from "prop-types";
import * as ReactRedux from "react-redux";
import { Link } from "react-router";

import Alert from "react-s-alert";
import moment from "moment";

import { momentDateFormat }  from "../../../../config.js";

import Loading from "../../../components/Loading.jsx";
import DropDown from "../../../components/DropDown.jsx";
import { Duplicate, Cross, Pencil, Plus, Inbox, EyeClose, EyeOpen, OptionVertical } from "../../../components/Icons.jsx";

import ApplicationStatusSummary from "../application/ApplicationStatusSummary.jsx";

import {fetchAudits, deleteAudit} from "../../actions/audit.js";

import { findAuditsByAuditCycleId } from "../../selectors/audit.js";



import { auditPropType } from "../../prop_types";


export class __AuditRow extends Component{
	static propTypes = {
		audit: PropTypes.object,

		auditCycleId: PropTypes.oneOfType([
			PropTypes.number,
			PropTypes.string,
		]).isRequired,
		serial: PropTypes.number.isRequired,
		showAuditDate: PropTypes.bool,
		showPriority: PropTypes.bool,

		onDelete: PropTypes.func.isRequired,

		dispatch: PropTypes.func.isRequired,
	};

	constructor(props){
		super(props);
		this.state = {
			expanded: false,
		};
	}

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

		let trStyle = Object.assign({}, {
			backgroundColor
		}, this.state.expanded ? expandedBorder : {},
		this.state.expanded ? { fontSize : "130%", fontWeight: "bold", } : {},
		this.props.audit.count === 0 ? { opacity : "0.3" } : {},
		);

		return(
			<tbody>
				<tr style={trStyle} className={this.state.expanded ? "active" : ""}>
					<td className="text-right">{this.props.serial}</td>
					<td>
						{this.props.audit.store.name} {this.props.audit.store.code && " - "+this.props.audit.store.code}
						<br/>
						<small className="text-muted">{this.props.audit.store.address}</small>
					</td>
					{ this.props.showPriority ? <td className="text-right">{this.props.audit.store.priority}</td> : null }
					{ this.props.showAuditDate ? <td className="text-right">{moment(this.props.audit.audit_date).isValid() ? moment(this.props.audit.audit_date).format(momentDateFormat) : null}</td> : null }
					<td>{this.props.audit.store.city.name}</td>
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
						</div>
					</td>
				</tr>
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

		let showAuditDate = false, showPriority = false;

		for(let id in this.props.audits){
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
			.map( a => <AuditRow key={a.id}
				showAuditDate={showAuditDate}
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
					<button type="button" className="btn btn-default"
						onClick={(e)=>{e.stopPropagation(); this.auditDropDown && this.auditDropDown.toggle();}}>
						<span className="caret"></span>
					</button>
					<DropDown ref={(d) => this.auditDropDown=d}>
						<li>
							<Link to={`/audit_cycle/${this.props.params.auditCycleId}/audit/copy`} title="Copy Audits">
								<Duplicate/> Copy Audits
							</Link>
						</li>
					</DropDown>
				</div>
				<Inbox/> Audits
			</h3>
			<ApplicationStatusSummary auditCycleId={this.props.params.auditCycleId}/>
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
						<th>&nbsp;</th>
					</tr>
				</thead>
				{rows}
			</table>
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
