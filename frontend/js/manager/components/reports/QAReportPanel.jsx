import React, { Component } from "react";

import { getQAReportPanels } from "../../service/reports.js";
import { findModerators } from "../../service/moderator.js";

import { getAuditStoreStatus, getMonthName } from "../../../utils.js";

import Loading from "../../../components/Loading.jsx";
import { Link } from "react-router";

export default class QAReportPanel extends Component {
	constructor(props) {
		super(props);
		this.state = {
			qa: "",
			client: "",
			audit_cycle_id: "",
			month: ("0" + (new Date().getMonth() + 1)).slice(-2),
			year: new Date().getFullYear(),
			loading: false,
			qas: [],
			reports: [],
			client_list: [],
			audit_cycle_list: [],
		};
	}

	componentDidMount() {
		findModerators().then((qas) => {
			if (qas) {
				let qa_list = qas.filter((qa) => qa.is_active === true);
				this.setState({
					qas: qa_list,
				});
			}
		});
		this.setLoading(true);
		this.reload_data(
			this.state.client,
			this.state.audit_cycle_id,
			this.state.month,
			this.state.year,
			this.state.qa
		);
	}

	reload_data = (client, audit_cycle_id, month, year, qa) => {
		getQAReportPanels(client, audit_cycle_id, month, year, qa).then((res) => {
			if (res) {
				this.setState({
					reports: res.audit_store_data || [],
					client_list: res.client_list || [],
					audit_cycle_list: res.audit_cycle_list || [],
					loading: false,
				});
			}
		});
	};

	setLoading = (loading) => {
		this.setState((prevState) => Object.assign({}, prevState, { loading }));
	};

	month_changed = (e) => {
		this.setState({
			month: e.target.value,
		});
		this.setLoading(true);
		this.reload_data(
			this.state.client,
			this.state.audit_cycle_id,
			e.target.value,
			this.state.year,
			this.state.qa
		);
	};

	year_changed = (e) => {
		this.setState({
			year: e.target.value,
		});
		this.setLoading(true);
		this.reload_data(
			this.state.client,
			this.state.audit_cycle_id,
			this.state.month,
			e.target.value,
			this.state.qa
		);
	};

	qa_changed = (e) => {
		this.setState({
			qa: e.target.value,
		});
		this.setLoading(true);
		this.reload_data(
			this.state.client,
			this.state.audit_cycle_id,
			this.state.month,
			this.state.year,
			e.target.value
		);
	};

	client_changed = (e) => {
		this.setState({
			client: e.target.value,
		});
		this.reload_data(
			e.target.value,
			this.state.audit_cycle_id,
			this.state.month,
			this.state.year,
			this.state.qa
		);
	};
	audit_cycle_changed = (e) => {
		this.setState({
			audit_cycle_id: e.target.value,
		});
		this.reload_data(
			this.state.client,
			e.target.value,
			this.state.month,
			this.state.year,
			this.state.qa
		);
	};
	getTotalSeconds = (timeStr) => {
		const [h, m, s] = timeStr.split(":").map(Number);
		return h * 3600 + m * 60 + s;
	};

	formatSecondsToTime = (totalSeconds) => {
		const h = Math.floor(totalSeconds / 3600)
			.toString()
			.padStart(2, "0");
		const m = Math.floor((totalSeconds % 3600) / 60)
			.toString()
			.padStart(2, "0");
		const s = (totalSeconds % 60).toString().padStart(2, "0");
		return `${h}:${m}:${s}`;
	};
	render() {
		if (this.state.loading) {
			return <Loading />;
		}
		var year = new Date().getFullYear();
		let year_option_list = [];
		for (var i = 0; i < 10; i++) {
			year_option_list.push(
				<option key={i} value={year - i}>
					{year - i}
				</option>
			);
		}

		const qa_option_list = this.state.qas.map((m, i) => (
			<option key={i} value={m.id}>
				{m.email}
			</option>
		));
		let totalQaSeconds = 0;
		let totalAuditorSeconds = 0;

		this.state.reports.forEach((value) => {
			if (value.report_submission_time) {
				totalAuditorSeconds += this.getTotalSeconds(
					value.report_submission_time
				);
			}
			if (value.moderator_submission_time) {
				totalQaSeconds += this.getTotalSeconds(value.moderator_submission_time);
			}
		});

		const totalQaTime = this.formatSecondsToTime(totalQaSeconds);
		const totalAuditorTime = this.formatSecondsToTime(totalAuditorSeconds);

		let report_blocks = this.state.reports.map((value, index) => {
			return (
				<tr key={index}>
					<td className="text-center">
						<small>{value.client}</small>
					</td>
					<td className="text-center">
						<small>{value.audit_cycle_name}</small>
					</td>
					<td className="text-center">{getMonthName(value.month)}</td>
					<td className="text-center">{value.year}</td>
					<td className="text-center">
						<small>{value.qa_email}</small>
					</td>
					<td className="text-center">{getAuditStoreStatus(value.audit_store_status)}</td>
					<td className="text-center">
						{value.report_submission_time
							? value.report_submission_time
							: "00:00:00"}
					</td>
					<td className="text-center">
						{value.moderator_submission_time
							? value.moderator_submission_time
							: "00:00:00"}
					</td>

					<td className="text-center">
						<Link
							to={`/audit_store/${value.audit_store_id}/report`}
							className="btn btn-default"
							target="_blank"
						>
							View
						</Link>
					</td>
				</tr>
			);
		});
		return (
			<div>
				<div className="table-responsive">
					<table className="table table-hover table-striped table-bordered table-condensed">
						<thead>
							<tr>
								<th className="text-center">
									<select
										name="client"
										className="form-control"
										value={this.state.client}
										onChange={this.client_changed}
									>
										<option value="">Select Client</option>
										{this.state.client_list.map((client) => (
											<option key={client.id} value={client.id}>
												{client.name}
											</option>
										))}
									</select>
								</th>

								<th className="text-center">
									<select
										name="audit_cycle_id"
										className="form-control"
										value={this.state.audit_cycle_id}
										onChange={this.audit_cycle_changed}
									>
										<option value="">Select Audit Cycle</option>
										{this.state.audit_cycle_list.map((cycle) => (
											<option key={cycle.id} value={cycle.id}>
												{cycle.name}
											</option>
										))}
									</select>
								</th>

								<th className="text-center">
									<select
										name="month"
										className="form-control"
										value={this.state.month}
										onChange={this.month_changed}
									>
										<option value="">Select month</option>
										<option value="01">January</option>
										<option value="02">February</option>
										<option value="03">March</option>
										<option value="04">April</option>
										<option value="05">May</option>
										<option value="06">June</option>
										<option value="07">July</option>
										<option value="08">August</option>
										<option value="09">September</option>
										<option value="10">October</option>
										<option value="11">November</option>
										<option value="12">December</option>
									</select>
								</th>
								<th className="text-center">
									<select
										name="year"
										className="form-control"
										value={this.state.year}
										onChange={this.year_changed}
									>
										{year_option_list}
									</select>
								</th>
								<th className="text-center">
									<select
										name="qa"
										className="form-control"
										value={this.state.qa}
										onChange={this.qa_changed}
									>
										<option value="">Select QA</option>
										{qa_option_list}
									</select>
								</th>
								<th className="text-center">Report Status</th>
								<th className="text-center">Auditor time</th>
								<th className="text-center">QA time</th>
								<th></th>
							</tr>
						</thead>
						<tbody>
							{this.state.reports.length === 0 ? (
								<tr>
									<td className="text-center" colSpan="9">
										<b>No data</b>
									</td>
								</tr>
							) : (
								<>
									{report_blocks}
									<tr>
										<td className="text-center" colSpan="6">
											<b>Total</b>
										</td>
										<td className="text-center">
											<b>{totalAuditorTime}</b>
										</td>
										<td className="text-center">
											<b>{totalQaTime}</b>
										</td>
										<td className="text-center">
											<b>{this.state.reports.length}</b>
										</td>
									</tr>
								</>
							)}
						</tbody>
					</table>
				</div>
			</div>
		);
	}
}