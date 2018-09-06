import React from "react";
import PropTypes from "prop-types";
import { Link } from "react-router";

import moment from "moment";
import { momentDateFormat }  from "../../../config.js";

import { fetchAuditStores } from "../service/audit_store.js";

import ExpandableDetails from "../../components/ExpandableDetails.jsx";
import AuditStoreStatusLabel from "../../components/AuditStoreStatusLabel.jsx";
import MarkdownViewer from "../../components/MarkdownViewer.jsx";

import { auditStorePropType } from "../prop_types.js";

export class AuditStoreRow extends React.Component {
	static propTypes = {
		auditStore: auditStorePropType.isRequired,
	};

	render() {
		const earnings_per_audit = this.props.auditStore.earnings_per_audit || this.props.auditStore.audit.earnings_per_audit;
		const fees = earnings_per_audit ? <b>Fees: ₹ {earnings_per_audit}, </b> : "";
		const reimbursement = this.props.auditStore.reimbursement || this.props.auditStore.audit.reimbursement;
		const reimb = reimbursement ? <span>Reimbursement upto: <b>₹ {reimbursement}</b></span> : "";

		let inlineBlockStyle = {
			display: "inline-block",
			marginBottom: "10px",
		};

		return (
			<div className="panel panel-default">
				<div className="panel-body">
					<h3 className="">
						<b>{this.props.auditStore.audit.audit_cycle.client.auditor_display_name}</b> - {this.props.auditStore.audit.store.name}
					</h3>
					<div>
						<AuditStoreStatusLabel status={this.props.auditStore.status}/>
						&nbsp;&nbsp;&bull;&nbsp;&nbsp;
						<div style={inlineBlockStyle}>
							<b>{moment(this.props.auditStore.audit_date).format(momentDateFormat)}</b>
						&nbsp;&nbsp;&bull;&nbsp;&nbsp;
						</div>
						<div style={inlineBlockStyle}>
							{<span>{fees}{reimb}</span>}
						&nbsp;&nbsp;&bull;&nbsp;&nbsp;
						</div>
						<div style={inlineBlockStyle}>
							<ExpandableDetails details={<div>
								<MarkdownViewer markdown={this.props.auditStore.audit.post_approval_description || ""}/>
								<MarkdownViewer markdown={this.props.auditStore.audit.audit_cycle.post_approval_description || ""}/>
							</div>}/>
						</div>
					</div>
					<p><b>Address:</b> {this.props.auditStore.audit.store.address}</p>
					<Link to={`/reports/${this.props.auditStore.id}`} className="btn btn-default">View</Link>
				</div>
			</div>
		);
	}
}

export class __AuditStoreList extends React.Component {

	static propTypes = {
		auditStores: PropTypes.arrayOf(auditStorePropType).isRequired,
	};

	render() {
		const rows = this.props.auditStores.map(as => <AuditStoreRow auditStore={as} key={as.id}/>);
		if(rows.length > 0){
			return (
				<div>
					<h2 className="page-header">
						Your Audits
					</h2>
					{ rows }
				</div>
			);
		} else {
			return (
				<div className="jumbotron text-center">
					<h2>There are no audits approved for you.</h2>
				</div>
			);
		}
	}
}

export default class AuditStoreList extends React.Component {
	state = {
		auditStores: [],
	};

	componentDidMount() {
		fetchAuditStores().then( auditStores => this.setState({auditStores}));
	}

	render() {
		return <__AuditStoreList auditStores={this.state.auditStores}/>;
	}
}
