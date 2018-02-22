import React, { Component } from "react";
import PropTypes from "prop-types";
import { hashHistory } from "react-router";

import Loading from "../../components/Loading.jsx";
import Jumbotron from "../../components/Jumbotron.jsx";
import { } from "../../components/Icons.jsx";

import { pointerStyle }  from "../../styles.js";

import moment from "moment";
import { momentDateFormat }  from "../../../config.js";
import { getColor } from "../../utils.js";

import { fetchAuditCycles } from "../service/audit_cycle.js";
import { findAuditStoresByAuditCycle } from "../service/audit_store.js";
import { fetchUser } from "../service/user.js";

class WeightedAuditStoreTable extends Component {
	static propTypes = {
		auditCycleId: PropTypes.oneOfType([
			PropTypes.string,
			PropTypes.number,
		]).isRequired,
		clientId: PropTypes.oneOfType([
			PropTypes.string,
			PropTypes.number,
		]).isRequired,
	};

	constructor(props){
		super(props);
		this.state = {
			loading: false,
			reports: [],
			weights: {
				23: {
					"Staff Grooming": 15,
					"Counter": 15,
					"Overall Ambiance": 20,
					"Customer Service": 25,
					"Objection Handling": 20,
					"Feedback": 5,
				}
			}
		};
	}
	setLoading = (loading) => {
		this.setState( prevState => {
			return Object.assign({}, prevState, {
				loading
			});
		});
	};
	reloadData = (auditCycleId) => {
		this.setLoading(true);
		findAuditStoresByAuditCycle(auditCycleId).then(reports => {
			this.setState({
				reports,
			});
		}).always(() => this.setLoading(false));
	};

	componentDidMount(){
		this.reloadData(this.props.auditCycleId);
	}
	componentWillReceiveProps(nextProps){
		if(this.props.auditCycleId !== nextProps.auditCycleId){
			this.reloadData(nextProps.auditCycleId);
		}
	}

	render(){
		if(this.state.loading){
			return (<Loading/>);
		}
		if(this.state.reports.length === 0) {
			return (<Jumbotron heading="there are no audits here" para="try changing audit cycle"/>);
		}
		let headers = [];
		headers.push(<th key="store_name">Name</th>);
		headers.push(<th key="date" className="text-right">Date</th>);
		headers = headers.concat(
			this.state.reports[0].sections
				.filter(s => s.max_marks > 0)
				.map(s => [s, this.state.weights[this.props.clientId][s.section]])
				.map(([s, w]) => <th key={s.sequence} className="text-right">{s.section}<br/>({w}% wt.)</th>));

		let trs = [];
		let previousStore;
		this.state.reports.forEach( r => {
			let tds = [];
			let storeName = previousStore === r.store_id ? "" : r.store_name;
			let cityName = previousStore === r.store_id ? "" : r.city_name;
			let tdStyle = {};
			if(previousStore === r.store_id){
				//trs.push(<td colSpan={2 + tds.length}>&nbsp;</td>);
				tdStyle.borderTop = "solid White 0px";
			}
			if(previousStore !== r.store_id){
				//trs.push(<td colSpan={2 + tds.length}>&nbsp;</td>);
				tdStyle.borderTop = "solid lightgray 2px";
			}
			for(let s of r.sections){
				if(s.max_marks > 0){
					let w = this.state.weights[this.props.clientId][s.section];
					tds.push(
						<td key={s.sequence} className={getColor(s.color) + " text-right"} 
							style={tdStyle}>
							{s.percentage === null ? "N/A" : Math.floor(s.percentage * w / 100)  +"%" }
						</td>);
				}
			}
			trs.push(
				<tr key={r.audit_store_id} style={pointerStyle} onClick={()=> hashHistory.push(`/audit_store/${r.audit_store_id}`)}>
					<td style={tdStyle}>
						<b>{storeName}</b><br/>
						<small>{cityName}</small>
					</td>
					<td className="text-right" style={tdStyle}>{moment(r.audit_date).format(momentDateFormat)}</td>
					{tds}
				</tr>
			);
			previousStore = r.store_id;
		});
		return (
			<div>
				<table className="table table-bordered table-hover">
					<thead>
						<tr>{headers}</tr>
					</thead>
					<tbody>
						{trs}
					</tbody>
				</table>
			</div>
		);
	}
}

export default class WeightedReportBrowser extends Component{
	constructor(props){
		super(props);
		this.state = {
			unsupported: false,
			loading: false,
			auditCycles: [],
			activeClients: [23],
			selectedAuditCycleId: "",
			currentUser: undefined,
		};
	}
	setLoading = (loading) => {
		this.setState( prevState => {
			return Object.assign({}, prevState, {
				loading
			});
		});
	};
	componentDidMount() {
		this.setLoading(true);
		fetchUser().then((user) => {
			this.setState({currentUser: user});
			if(this.state.activeClients.includes(user.client.id)){
				fetchAuditCycles().then((auditCycles)=>{
					this.setState({
						auditCycles,
					});
					if( auditCycles.length > 0){
						this.auditCycleChanged(auditCycles[0].audit__audit_cycle__id);
					}
				});
			} else {
				this.setState({unsupported: true});
			}
		});
	}

	auditCycleChanged = (selectedAuditCycleId) => {
		this.setState({ selectedAuditCycleId });
	};

	render(){
		if(this.state.auditCycles.length === 0){
			return (<Jumbotron heading="there are no reports here" para="yet"/>);
		}
		if(! this.state.selectedAuditCycleId){
			return <Loading/>;
		}
		if(this.state.unsupported){
			return (<Jumbotron heading="this report type is not active" para=""/>);
		}
		let auditCycleRows = [];
		for(let ac of this.state.auditCycles) {
			auditCycleRows.push(<option value={ac.audit__audit_cycle__id} key={ac.audit__audit_cycle__id}>{ac.audit__audit_cycle__name}</option>);
		}

		return (
			<div>
				<h2 className="page-header">
					Audit Cycle:&nbsp;
					<select className="form-control input-lg" style={{width:"400px", display:"inline-block"}} name="audit_cycle" value={this.state.selectedAuditCycleId} onChange={(e) => this.auditCycleChanged(parseInt(e.target.value))}>
						{auditCycleRows}
					</select>
				</h2>
				<WeightedAuditStoreTable auditCycleId={this.state.selectedAuditCycleId} clientId={this.state.currentUser.client.id}/>
			</div>
		);
	}
}
