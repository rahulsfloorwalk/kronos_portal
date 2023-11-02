import React from "react";
import PropTypes from "prop-types";
import ApplicationStatusLabel from "../../components/ApplicationStatusLabel.jsx";
import moment from "moment";
import { momentDateFormat } from "../../../config.js";
import { findAppliedAudits, findAppliedAuditsLoadMore } from "../service/applied_audits.js";

import { Link } from "react-router";
class AppliedAuditRow extends React.Component {
	static propTypes = {
		seq: PropTypes.number.isRequired,
		appliedAudit: PropTypes.shape({
			id: PropTypes.string,
			audit_date: PropTypes.string,
			get_brand_name: PropTypes.shape({
				client_name: PropTypes.string,
			}),
			status: PropTypes.string,
			audit: PropTypes.shape({
				id: PropTypes.string,
				audit_cycle: PropTypes.shape({
					id: PropTypes.number,
				}),
			}),
		})
	};
	render() {
		const currentDate = new Date().toISOString().slice(0, 10);
		return (
			<tr>
				<td>
					{this.props.seq}
				</td>
				<td >
					{this.props.appliedAudit.get_brand_name.client_name ? this.props.appliedAudit.get_brand_name.client_name : "N/A"}
				</td>
				<td >
					<tr style={{fontWeight:"bold"}}>
						{moment(this.props.appliedAudit.audit_date).format(momentDateFormat)}
					</tr>
					{currentDate > this.props.appliedAudit.audit_date && this.props.appliedAudit.status == "APPLIED" ?
						<tr>
							<div>
								<span style={{ color: "red", fontSize: "10px" }}><i>(Your audit application date has passed,<br /> kindly select a new date using the reapply button.)</i></span>
							</div>
						</tr>
						: null}
				</td>
				<td >
					{this.props.appliedAudit.status == "APPLIED"
						?
						<b >
							<ApplicationStatusLabel status={this.props.appliedAudit.status} />&nbsp;&nbsp;
							{
								currentDate > this.props.appliedAudit.audit_date
									?
									(
										<Link testDecoration='None' className='btn-sm btn-success' to={`audit/cycle/${this.props.appliedAudit.audit.audit_cycle.id}/audit/${this.props.appliedAudit.audit.id}/reapply`}>
											Re Apply
										</Link>
									)
									:
									null
							}
						</b>
						: this.props.appliedAudit.status == "APPROVED"
							?
							<b ><ApplicationStatusLabel status={this.props.appliedAudit.status} /></b>
							: this.props.appliedAudit.status == "WAITLISTED"
								?
								<b ><ApplicationStatusLabel status={this.props.appliedAudit.status} /></b>
								: this.props.appliedAudit.status == "REJECTED"
									?
									<b ><ApplicationStatusLabel status={this.props.appliedAudit.status} /> </b>
									: this.props.appliedAudit.status == "WITHDRAWN"
										?
										<b ><ApplicationStatusLabel status={this.props.appliedAudit.status} /> </b>
										: this.props.appliedAudit.status == "NOT_APPLIED"
											?
											<b ><ApplicationStatusLabel status={this.props.appliedAudit.status} /> </b>
											: null
					}
				</td>
			</tr>
		);
	}
}

export default class AppliedAuditList extends React.Component {
	static propTypes = {
		children: PropTypes.node,
	};
	state = {
		appliedAudit: [],
		loadMoreLoader: false,
		loading: false,
		total_count: 0,
		appliedAudit_list_count: 0,
	};

	setLoading = (loading) => {
		this.setState(oldState => Object.assign({}, oldState, { loading }));
	};

	componentDidMount() {
		this.setLoading(true);
		findAppliedAudits().then((appliedAudit) => {
			this.setState({
				appliedAudit: appliedAudit.applied_audits,
				total_count: appliedAudit.total_count,
				appliedAudit_list_count: appliedAudit.applied_audits.length,
			});
		});
	}
	// componentWillReceiveProps() {
	// 	this.componentDidMount();
	// }
	loadMoreReports = () => {
		this.setState({
			loadMoreLoader: true
		});
		let is_load_more = true;
		findAppliedAuditsLoadMore(is_load_more, this.state.appliedAudit_list_count).then(result => {
			let appliedAudits = result.applied_audits;
			this.setState(prevState => ({
				appliedAudit: [...prevState.appliedAudit, ...appliedAudits],
				appliedAudit_list_count: prevState.appliedAudit.length + appliedAudits.length,
				loadMoreLoader: false,
			}));
		});
	};
	render() {
		const rows = this.state.appliedAudit.map((app, i) => <AppliedAuditRow seq={i + 1} appliedAudit={app} key={app.id} />);
		let loadMoreButton;
		if (this.state.total_count > this.state.appliedAudit_list_count) {
			loadMoreButton = (<button className="btn btn-default" onClick={this.loadMoreReports}>
				Load More
			</button>);
		}
		return (
			<div className="panel panel-default table-responsive">
				<h3 style={{ padding: "2rem", borderBottom: "1px solid #eee" }}>
					Applied Audits
				</h3>
				<div style={{ padding: "2rem" }}>
					<table className="table table-striped">
						<thead>
							<tr>
								<th>#</th>
								<th>Client Name</th>
								<th>Audit Date</th>
								<th>Status</th>
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
			</div>
		);
	}
}