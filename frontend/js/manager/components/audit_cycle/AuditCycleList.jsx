import React from "react";
import PropTypes from "prop-types";
import { Link } from "react-router";

import moment from "moment";
import { momentDateFormat }  from "../../../../config.js";

import { Plus, Retweet } from "../../../components/Icons.jsx";
import AuditTypeLabel from "../../../components/AuditTypeLabel.jsx";
import { fetchAuditCyclesByClient,findAuditCyclesByClientLoadMore } from "../../service/audit_cycle.js";
import { getAuditStatus } from "../../../utils.js";

class AuditCycleRow extends React.Component{
	static propTypes = {
		auditCycle: PropTypes.shape({
			id: PropTypes.number,
			name: PropTypes.string,
			start_date: PropTypes.string,
			end_date: PropTypes.string,
			status: PropTypes.string,
			type: PropTypes.string,

			questionnaire_type: PropTypes.object,
		}).isRequired,
	};

	render(){
		var linkTo = `/audit_cycle/${this.props.auditCycle.id}/questionnaire`;
		return (
			<tr>
				<td>{this.props.auditCycle.name}</td>
				<td>{moment(this.props.auditCycle.start_date).format(momentDateFormat)}</td>
				<td>{moment(this.props.auditCycle.end_date).format(momentDateFormat)}</td>
				<td><AuditTypeLabel auditType={this.props.auditCycle.type}/></td>
				<td>{this.props.auditCycle.questionnaire_type && this.props.auditCycle.questionnaire_type.name}</td>
				<td>{getAuditStatus(this.props.auditCycle.status)}</td>
				<td>
					<Link to={linkTo} className="btn btn-default pull-right">View</Link>
				</td>
			</tr>
		);
	}
}

export default class AuditCycleList extends React.Component{
	static propTypes = {
		params: PropTypes.shape({
			clientId: PropTypes.string.isRequired,
		}).isRequired,

		children: PropTypes.node,
	};

	state = {
		auditCycles: [],
		loadMoreLoader: false,
		loading: false,
		total_count: 0,
		auditcycles_list_count: 0,
	};

	componentDidMount() {
		fetchAuditCyclesByClient(this.props.params.clientId).then((auditCycles) => {
			this.setState({
				auditCycles: auditCycles.audit_cycles,
				total_count: auditCycles.total_count,
				auditcycles_list_count: auditCycles.audit_cycles.length,
			});
		});
	}	
	loadMoreCycles = () => {
		this.setState({
		  loadMoreLoader: true
		});
		let is_load_more = true;
		findAuditCyclesByClientLoadMore(is_load_more, this.state.auditcycles_list_count, this.props.params.clientId).then(result => {
		  console.log("34", result.audit_cycles);
		  let auditCyclesList = result.audit_cycles;
		  this.setState(prevState => ({
			auditCycles: [...prevState.auditCycles, ...auditCyclesList], 
			auditcycles_list_count: prevState.auditcycles_list_count + auditCyclesList.length, 
			loadMoreLoader: false,
		  }));
		});
	  };
	  
	render(){
		let rows = [];
		for(let ac of this.state.auditCycles) {
			rows.push(<AuditCycleRow auditCycle={ac} key={ac.id}/>);
		}
		let addAuditCycleLink = `/client/${this.props.params.clientId}/audit_cycle/add`;
		let loadMoreButton;
		if (this.state.total_count > this.state.auditcycles_list_count) {
			loadMoreButton = (<button className="btn btn-default" onClick={this.loadMoreCycles}>
				Load More
			</button>);
		}
		return (
			<div className="table-responsive">
				<h3 className="page-header">
					<Link to={addAuditCycleLink} className="btn btn-default pull-right"><Plus/> Add Audit Cycle</Link>
					<Retweet/> Audit Cycles
				</h3>
				<table className="table table-striped">
					<thead>
						<tr>
							<th>Cycle Name</th>
							<th>Start Date</th>
							<th>End Date</th>
							<th>Audit Type</th>
							<th>Questionnaire Type</th>
							<th>Audit Status</th>
							<th></th>
						</tr>
					</thead>
					<tbody>
						{rows}
					</tbody>
				</table>
				<div className="text-center">
					{loadMoreButton}
				</div>
				{this.props.children}
			</div>
		);
	}
}