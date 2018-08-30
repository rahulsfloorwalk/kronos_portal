import React from "react";
import { Link } from "react-router";

import moment from "moment";
import { momentDateFormat }  from "../../../config.js";

import { fetchAuditCycle } from "../actions/audit.js";
import { fetchApplicationStats } from "../service/audit_cycle_stats.js";

import AuditStoreStatusLabel from "../../components/AuditStoreStatusLabel.jsx";
import ApplicationStatusLabel from "../../components/ApplicationStatusLabel.jsx";
import { King, Retweet, Inbox, Tasks, Pencil, File } from "../../components/Icons.jsx";
import NavLink from "../../components/NavLink.jsx";
import Panel from "../../components/Panel.jsx";
import Loading from "../../components/Loading.jsx";

import { getAuditType, getAuditStatus, getAuditApplicationStatus } from "../../utils.js";

export default class extends React.Component {
    state = {};

    componentDidMount() {
    	this._promise = fetchApplicationStats(this.props.auditCycleId).done((stats) => this.setState({ stats }));
    }

    componentWillUnmount() {
    	this._promise && this._promise.readyState !== 4 && this._promise.abort();
    }

    render() {
    	if(! this.state.stats){
    		return <Loading/>;
    	}
    	return (
    		<table className="table table-bordered">
    			<thead>
    				<tr>
    					{
    						["APPLIED", "WAITLISTED", "APPROVED", "REJECTED"].map((status) => {
    							return (
    								<td key={status} className="text-center">
    									<ApplicationStatusLabel status={status} />
    								</td>
    							);
    						})
    					}
    				</tr>
    			</thead>
    			<tbody>
    				<tr>
    					{
    						["APPLIED", "WAITLISTED", "APPROVED", "REJECTED"].map((status) => {
    							let item = this.state.stats.find( s => s.status === status);
    							return (
    								<td key={status} className="text-center">
    									<b>{item ? item.count : null}</b>
    								</td>
    							);
    						})
    					}
    				</tr>
    			</tbody>
    		</table>
    	);
    }
}

