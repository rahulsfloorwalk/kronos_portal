import React from "react";
import ReactDOM from "react-dom";
import PropTypes from "prop-types";

import Loading from "../../components/Loading.jsx";
import Jumbotron from "../../components/Jumbotron.jsx";

import { fetchAuditorExecutionReport } from "../service/auditor_export_summary";
import AuditorExecutionReportModal from "./AuditorExecutionReportModal.jsx";
import { getAuditStoreStatus } from "../../utils.js";

const COLUMNS = [
	{ key: "auditor_name", label: "Auditor Name" },
	{ key: "auditor_mobile_number", label: "Mobile Number" },
	{ key: "audit_dates", label: "Audit Dates" },
	{ key: "cities", label: "Cities", filterable: true },
	{ key: "report_status", label: "Report Status", filterable: true },
	{ key: "grand_total", label: "Grand Total", numeric: true, sortable: true },
	{ key: "pending_execution", label: "Pending Execution", numeric: true, sortable: true },
	{ key: "done_audits", label: "Done Audits", numeric: true, sortable: true },
	{ key: "failed_reports", label: "Failed Reports", numeric: true, sortable: true },
	{ key: "comment", label: "Comment", filterable: true },
];

class SearchableDropdownFilter extends React.Component {
	static propTypes = {
		label: PropTypes.string.isRequired,
		options: PropTypes.arrayOf(PropTypes.shape({
			value: PropTypes.string.isRequired,
			label: PropTypes.string.isRequired,
		})).isRequired,
		selectedValue: PropTypes.string,
		onSelect: PropTypes.func.isRequired,
	};

	static defaultProps = {
		selectedValue: "",
	};

	state = {
		isOpen: false,
		searchTerm: "",
		menuStyle: {},
	};

	triggerRef = React.createRef();
	menuRef = React.createRef();

	componentDidMount(){
		document.addEventListener("mousedown", this.handleOutsideClick);
	}

	componentWillUnmount(){
		document.removeEventListener("mousedown", this.handleOutsideClick);
	}

	handleOutsideClick = (e) => {
		const clickedTrigger = this.triggerRef.current && this.triggerRef.current.contains(e.target);
		const clickedMenu = this.menuRef.current && this.menuRef.current.contains(e.target);
		if(!clickedTrigger && !clickedMenu) {
			this.setState({ isOpen: false, searchTerm: "" });
		}
	};

	toggleOpen = () => {
		if(this.state.isOpen) {
			this.setState({ isOpen: false, searchTerm: "" });
			return;
		}
		const rect = this.triggerRef.current.getBoundingClientRect();
		this.setState({
			isOpen: true,
			searchTerm: "",
			menuStyle: {
				position: "fixed",
				top: rect.bottom + 2,
				left: rect.left,
				width: Math.max(rect.width, 200),
				zIndex: 2000,
			},
		});
	};

	handleSearchChange = (e) => {
		this.setState({ searchTerm: e.target.value });
	};

	handleSelect = (value) => {
		this.props.onSelect(value);
		this.setState({ isOpen: false, searchTerm: "" });
	};

	render(){
		const { label, options, selectedValue } = this.props;
		const { isOpen, searchTerm, menuStyle } = this.state;

		const filteredOptions = options.filter(opt =>
			opt.label.toLowerCase().indexOf(searchTerm.toLowerCase()) !== -1
		);

		const selectedOption = options.find(opt => opt.value === selectedValue);
		const buttonText = selectedOption ? selectedOption.label : ("All " + label);

		const menu = isOpen && ReactDOM.createPortal(
			<div
				ref={this.menuRef}
				className="dropdown-menu"
				style={{ ...menuStyle, display: "block", padding: "6px" }}
			>
				<input
					type="text"
					className="form-control input-sm"
					placeholder={"Search " + label}
					value={searchTerm}
					onChange={this.handleSearchChange}
					autoFocus
					style={{ marginBottom: "6px" }}
				/>
				<div style={{ maxHeight: "180px", overflowY: "auto" }}>
					<div
						role="button"
						style={{ padding: "4px 8px", cursor: "pointer", fontWeight: selectedValue === "" ? "bold" : "normal" }}
						onClick={() => this.handleSelect("")}
					>
						All {label}
					</div>
					{filteredOptions.map(opt => (
						<div
							key={opt.value}
							role="button"
							style={{ padding: "4px 8px", cursor: "pointer", fontWeight: selectedValue === opt.value ? "bold" : "normal" }}
							onClick={() => this.handleSelect(opt.value)}
						>
							{opt.label}
						</div>
					))}
					{filteredOptions.length === 0 &&
						<div style={{ padding: "4px 8px", color: "#999" }}>No matches</div>
					}
				</div>
			</div>,
			document.body
		);

		return (
			<div style={{ position: "relative", marginTop: "4px" }}>
				<div
					ref={this.triggerRef}
					className="form-control"
					role="button"
					onClick={this.toggleOpen}
					style={{
						cursor: "pointer",
						display: "flex",
						justifyContent: "space-between",
						alignItems: "center",
						overflow: "hidden",
						textOverflow: "ellipsis",
						whiteSpace: "nowrap",
					}}
				>
					<span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
						{buttonText}
					</span>
					<span className="caret" style={{ marginLeft: "6px", flexShrink: 0 }}/>
				</div>
				{menu}
			</div>
		);
	}
}

export class AuditCycleAuditorExecutionSummary extends React.Component {
	static propTypes = {
		params: PropTypes.shape({
			auditCycleId: PropTypes.string.isRequired,
		}).isRequired,
	};

	state = {
		loading: true,
		data: [],
		sortKey: null,
		sortDirection: "asc",
		activeModal: null,
		cityFilter: "",
		reportStatusFilter: "",
		commentFilter: "",
	};

	componentDidMount(){
		fetchAuditorExecutionReport(this.props.params.auditCycleId).then(data => {
			this.setState({ data, loading: false });
		});
	}

	handleSort = (key) => {
		this.setState(prevState => {
			const sortDirection = prevState.sortKey === key && prevState.sortDirection === "asc" ? "desc" : "asc";
			return { sortKey: key, sortDirection };
		});
	};

	getCityOptions(){
		const cities = {};
		this.state.data.forEach(row => {
			if(row.cities) {
				String(row.cities).split(",").forEach(city => {
					const trimmed = city.trim();
					if(trimmed) {
						cities[trimmed] = trimmed;
					}
				});
			}
		});
		return Object.keys(cities).sort().map(city => ({ value: city, label: city }));
	}

	getReportStatusOptions(){
		const statuses = {};
		this.state.data.forEach(row => {
			if(row.report_status) {
				String(row.report_status).split(",").forEach(status => {
					const trimmed = status.trim();
					if(trimmed) {
						statuses[trimmed] = getAuditStoreStatus(trimmed);
					}
				});
			}
		});
		return Object.keys(statuses).sort().map(status => ({ value: status, label: statuses[status] }));
	}

	getCommentOptions(){
		const comments = {};
		this.state.data.forEach(row => {
			if(row.comment) {
				comments[row.comment] = row.comment;
			}
		});
		return Object.keys(comments).sort().map(comment => ({ value: comment, label: comment }));
	}

	getFilteredData(){
		const { data, cityFilter, reportStatusFilter, commentFilter } = this.state;
		return data.filter(row => {
			if(cityFilter) {
				const cities = row.cities ? String(row.cities).split(",").map(c => c.trim()) : [];
				if(cities.indexOf(cityFilter) === -1) {
					return false;
				}
			}
			if(reportStatusFilter) {
				const statuses = row.report_status ? String(row.report_status).split(",").map(s => s.trim()) : [];
				if(statuses.indexOf(reportStatusFilter) === -1) {
					return false;
				}
			}
			if(commentFilter) {
				if(row.comment !== commentFilter) {
					return false;
				}
			}
			return true;
		});
	}

	getSortedData(){
		const filtered = this.getFilteredData();
		const { sortKey, sortDirection } = this.state;
		if(!sortKey) {
			return filtered;
		}
		const sorted = [...filtered].sort((a, b) => {
			const result = a[sortKey] - b[sortKey];
			return sortDirection === "asc" ? result : -result;
		});
		return sorted;
	}

	openModal = (row, status) => {
		this.setState({ activeModal: { userId: row.id, auditorName: row.auditor_name, status } });
	};

	closeModal = () => {
		this.setState({ activeModal: null });
	};

	render(){
		if(this.state.loading) {
			return <Loading/>;
		}

		if(this.state.data.length === 0) {
			return (<div>
				&nbsp;
				<Jumbotron key="empty" heading="no auditors found" para="no auditor execution data available for this audit cycle"/>
			</div>);
		}

		const sortedData = this.getSortedData();
		const rightAlign = { textAlign: "right" };

		const headings = COLUMNS.map(col => {
			if(col.sortable) {
				const isSorted = this.state.sortKey === col.key;
				const arrow = isSorted ? (this.state.sortDirection === "asc" ? " \u25B2" : " \u25BC") : "";
				return (
					<th key={col.key} style={rightAlign} onClick={() => this.handleSort(col.key)} role="button">
						{col.label}{arrow}
					</th>
				);
			}

			if(col.key === "cities") {
				return (
					<th key={col.key}>
						<div>{col.label}</div>
						<SearchableDropdownFilter
							label="Cities"
							options={this.getCityOptions()}
							selectedValue={this.state.cityFilter}
							onSelect={(value) => this.setState({ cityFilter: value })}
						/>
					</th>
				);
			}

			if(col.key === "report_status") {
				return (
					<th key={col.key}>
						<div>{col.label}</div>
						<SearchableDropdownFilter
							label="Statuses"
							options={this.getReportStatusOptions()}
							selectedValue={this.state.reportStatusFilter}
							onSelect={(value) => this.setState({ reportStatusFilter: value })}
						/>
					</th>
				);
			}

			if(col.key === "comment") {
				return (
					<th key={col.key}>
						<div>{col.label}</div>
						<SearchableDropdownFilter
							label="Comments"
							options={this.getCommentOptions()}
							selectedValue={this.state.commentFilter}
							onSelect={(value) => this.setState({ commentFilter: value })}
						/>
					</th>
				);
			}

			return <th key={col.key}>{col.label}</th>;
		});

		const rows = sortedData.length === 0
			? (<tr><td colSpan={COLUMNS.length} style={{ textAlign: "center" }}>No matching records</td></tr>)
			: sortedData.map(row => (
				<tr key={row.id}>
					{COLUMNS.map(col => {
						if(col.key === "pending_execution" || col.key === "done_audits") {
							const status = col.key === "pending_execution" ? "pending" : "completed";
							return (
								<td key={col.key} style={rightAlign}>
									<a href="#" style={{ textDecoration: "underline" }} onClick={(e) => { e.preventDefault(); this.openModal(row, status); }}>
										{row[col.key]}
									</a>
								</td>
							);
						}
						if(col.key === "report_status") {
							const raw = row[col.key];
							const mapped = raw
								? String(raw).split(",").map(s => getAuditStoreStatus(s.trim())).join(", ")
								: "";
							return <td key={col.key}>{mapped}</td>;
						}
						return (
							<td key={col.key} style={col.numeric ? rightAlign : null}>
								{row[col.key]}
							</td>
						);
					})}
				</tr>
			));

		return (<div className="table-responsive">
			&nbsp;
			<table className="table table-bordered table-striped">
				<thead>
					<tr>
						{headings}
					</tr>
				</thead>
				<tbody>
					{rows}
				</tbody>
			</table>
			{this.state.activeModal &&
				<AuditorExecutionReportModal
					auditCycleId={this.props.params.auditCycleId}
					userId={this.state.activeModal.userId}
					auditorName={this.state.activeModal.auditorName}
					status={this.state.activeModal.status}
					onClose={this.closeModal}
				/>
			}
		</div>);
	}
}

export default AuditCycleAuditorExecutionSummary;