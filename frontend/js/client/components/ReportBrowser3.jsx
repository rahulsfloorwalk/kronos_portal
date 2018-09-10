import React, { Component } from "react";
import PropTypes from "prop-types";

import Loading from "../../components/Loading.jsx";
import Jumbotron from "../../components/Jumbotron.jsx";

import moment from "moment";

import { fetchAuditCycles } from "../service/audit_cycle.js";
import { findAuditStoresByAuditCycle } from "../service/audit_store.js";
import { fetchQuestionnaireTypes } from "../service/dashboard.js";
import QuestionnaireTypeTabs from "./QuestionnaireTypeTabs.jsx";
import AuditStoreTable from "./AuditStoreTable.jsx";

export default class ReportBrowser3 extends Component{
	static propTypes = {
		children: PropTypes.node,
	};

	constructor(props){
		super(props);
		this.state = {
			loading: false,
			auditCycles: [],
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
		fetchAuditCycles().then((auditCycles)=>{
			this.setState({
				auditCycles,
			});
			if( auditCycles.length > 0){
				this.auditCycleChanged(auditCycles[0].audit__audit_cycle__id);
			}
		});
	}
	auditCycleChanged = (auditCycleId) => {
		this.setState((prevState)=> {
			return Object.assign({}, prevState, {
				selectedAuditCycleId: auditCycleId,
			});
		});
	};

	render(){
		if(this.state.auditCycles.length === 0){
			return (<Jumbotron heading="there are no reports here" para="yet"/>);
		}
		if(! this.state.selectedAuditCycleId){
			return <Loading/>;
		}
		var auditCycleRows = [];
		for(let ac of this.state.auditCycles) {
			auditCycleRows.push(<option value={ac.audit__audit_cycle__id} key={ac.audit__audit_cycle__id}>{ac.audit__audit_cycle__name}, {ac.audit__audit_cycle__questionnaire_type__name}</option>);
		}

		let auditCycle = this.state.auditCycles.filter( ac => ac.audit__audit_cycle__id === parseInt(this.state.selectedAuditCycleId))[0] || {};
		return (
			<div>
				<h2 className="page-header">
					<select className="form-control input-lg" style={{width:"400px", display:"inline-block"}} name="audit_cycle" value={this.state.selectedAuditCycleId} onChange={(e) => this.auditCycleChanged(parseInt(e.target.value))}>
						{auditCycleRows}
					</select>
					<small> {moment(auditCycle.audit__audit_cycle__start_date).format("Do MMM")} to {moment(auditCycle.audit__audit_cycle__end_date).format("Do MMM")}</small>
				</h2>
				<AuditStoreTable auditCycleId={this.state.selectedAuditCycleId} startDate={auditCycle.audit__audit_cycle__start_date} endDate={auditCycle.audit__audit_cycle__end_date}/>
				{this.props.children}
			</div>
		);
	}
}
