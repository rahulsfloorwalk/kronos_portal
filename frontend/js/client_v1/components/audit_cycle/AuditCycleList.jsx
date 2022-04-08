import React from "react";
import PropTypes from "prop-types";
import { Link } from "react-router";

import moment from "moment";
import { momentDateFormat }  from "../../../../config.js";

import { fetchAuditCycles} from "../../service/audit_cycle.js";

import { getAuditStatus } from "../../../utils.js";
import { Plus, Retweet } from "../../../components/Icons.jsx";
import AuditTypeLabel from "../../../components/AuditTypeLabel.jsx";
import Loading from "../../../components/Loading.jsx";



class AuditCycleRow extends React.Component{
	static propTypes = {
		clientId: PropTypes.string.isRequired,
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
		var linkTo = `audit_cycle/${this.props.auditCycle.id}/questionnaire`;
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


export default class AuditCycleList extends React.Component {
	static propTypes = {
		params: PropTypes.shape({
			clientId: PropTypes.string.isRequired,
		}).isRequired,
		children: PropTypes.node,
	};

	state = {
		auditCycles: [],
		loading: false
	};

	componentDidMount() {
		this.setState({
			loading: true
		});
		fetchAuditCycles().then((auditCycles)=>{
			this.setState({auditCycles, loading: false});
		});
	}

	render() {
		if(this.state.loading){
			return <Loading/>;
		}
		let rows = [];
		for(let cycle of this.state.auditCycles){
			rows.push(<AuditCycleRow clientId={this.props.params.clientId} auditCycle={cycle} key={cycle.id} />);
		}
		let addAuditCycleLink = `/projects/${this.props.params.clientId}/audit_cycle/add`;
		return (
			<div>
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
				{this.props.children}
			</div>
		);
	}
}