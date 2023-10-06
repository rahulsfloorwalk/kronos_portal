import React, { Component } from "react";
import { hashHistory } from "react-router";
import PropTypes from "prop-types";
import { getAuditOptions, getAuditCategory, getQuestionnaireType } from "../../../utils.js";
import { affectInputEventToComponent } from "../../../react_utils.js";
import FormInput from "../../../components/FormInput.jsx";
import { FormDateInput } from "../../../components/FormInput.jsx";
import FormSelect from "../../../components/FormSelect.jsx";
import FormTextarea from "../../../components/FormTextarea.jsx";
import SaveButton from "../../../components/SaveButton.jsx";
import Modal from "../../../components/Modal.jsx";
import FormErrorList from "../../../components/FormErrorList.jsx";
import { auditCategoryList, clientRequirementQuestionaryList } from "../../../constants.js";
import Select from "react-select";
import {  Plus, Cross } from "../../../components/Icons.jsx";

// class AttachmentItem extends React.Component {
//     static propTypes = {
//         attachment: PropTypes.shape({
//             direct_url: PropTypes.string.isRequired,
//             file_name: PropTypes.string.isRequired,
//         }),
//         deletable: PropTypes.bool.isRequired,
//         onDelete: PropTypes.func.isRequired,
//     };

//     static defaultProps = {
//         deletable: false,
//         onDelete: () => { },
//         attachment: {}
//     };

//     render() {
//         if (this.props.deletable) {
//             var deleteButton = <button onClick={() => this.props.onDelete(this.props.attachment)}
//                 className="btn btn-default btn-sm pull-right"
//                 title="Delete Attachment"><Cross />
//             </button>;
//         }
//         return (
//             <div className="list-group-item">
//                 {deleteButton}
//                 <big> <a href={this.props.attachment.direct_url} target="_blank" rel="noopener noreferrer" title="Click to download file">
//                     {this.props.attachment.file_name}
//                 </a></big>
//             </div>
//         );
//     }
// }


// const FieldErrors = PropTypes.arrayOf(PropTypes.string);

export default class ClientRequirementsForm extends Component {
	static propTypes = {
		params: PropTypes.shape({
			clientId: PropTypes.string,
			auditCycleId:PropTypes.string,
			clientRequirementId: PropTypes.string,
		}).isRequired,
	};
	state = {
		errors: {},
		start_date: "",
		end_date: "",
		problem_statement: "",
		type: "",
		category: [],
		qtype: [],
		number_of_audit: 0,
		set_up_fees: 0,
		price_per_audit: 0,
		execution_budget: 0,
		scope_of_work: "",
		audit_flow: "",
		project_manager_email: "",
		sales_representative_email: "",
		uploadMessage: "",
		attachments: [],
		inProgress: {},
		progress: "",
		expanded: false,
		uploading: false,
		auditRows: [{ id: Date.now(), number_of_audit: 0, type: "" }],
	};
	toggleExpand = () => {
		this.setState({ expanded: !this.state.expanded });
	};
	setProgressState = (tempId, progressState) => {
		this.setState((prevState) => {
			return Object.assign({}, prevState, {
				inProgress: Object.assign({}, prevState.inProgress, {
					[tempId]: Object.assign({}, prevState.inProgress[tempId], progressState)
				})
			});
		});
	};

	fieldChanged = (e) => {
		affectInputEventToComponent(e, this);
	};

	handleInputChange = (e, id) => {
		const { name, value } = e.target;
		const list = this.state.auditRows.map(item => {
			if (item.id === id) {
				return { ...item, [name]: value };
			}
			return item;
		});
		this.setState({ auditRows: list });
	};

	selectHandleChange = (selected_value, field_name) => {
		let selected_list = selected_value.map(val => val.value);
		this.setState((prevState) => {
			return Object.assign({}, prevState, {
				[field_name]: selected_list,
				[field_name + "_list"]: selected_value
			});
		});
	};

	dateChanged = (name, date) => {
		if (typeof date !== "string") {
			this.setState({
				[name]: date.format("YYYY-MM-DD")
			});
		}
	};

	startDateChanged = (date) => {
		this.dateChanged("start_date", date);
	};

	endDateChanged = (date) => {
		this.dateChanged("end_date", date);
	};

	addAuditRow = () => {
		this.setState(prevState => ({
			auditRows: [
				...prevState.auditRows,
				{ id: Date.now(), number_of_audit: 0, type: "" }
			]
		}));
	};

	handleRemoveClick = id => {
		const list = this.state.auditRows.filter(item => item.id !== id);
		this.setState({ auditRows: list });
	};

	onSubmit = (e) => {
		e.preventDefault();
	};

	render() {
		const categoryOptions = [];
		const questionaryOptions = [];

		for (let option of auditCategoryList) {
			categoryOptions.push({
				label: getAuditCategory(option),
				value: option
			});
		}
		for (let option of clientRequirementQuestionaryList) {
			questionaryOptions.push({
				label: getQuestionnaireType(option),
				value: option
			});
		}
		const auditRows = this.state.auditRows.map(row => (
			<div className="row" key={row.id} style={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
				<div className="col-md-6">
					<FormInput
						label="Number of Audits:"
						type="number"
						name="number_of_audit"
						onChange={(e) => this.handleInputChange(e, row.id)}
						value={row.number_of_audit}
					/>
				</div>
				<div className="col-md-6">
					<FormSelect
						label="Audit Type"
						name="type"
						onChange={(e) => this.handleInputChange(e, row.id)}
						value={row.type}
					>
						<option value=""></option>
						<option value="MYSTERY_AUDIT">{getAuditOptions("MYSTERY_AUDIT")}</option>
						<option value="REVEALED_AUDIT">{getAuditOptions("REVEALED_AUDIT")}</option>
						<option value="MYSTERY_REVEALED">{getAuditOptions("MYSTERY_REVEALED")}</option>
					</FormSelect>
				</div>
				<div className="col-md-2">
					{this.state.auditRows.length > 1 && (
						<button
							onClick={() => this.handleRemoveClick(row.id)}
						>
							<Cross />
						</button>
					)}
				</div>
			</div>
		));

		const canAddMore = auditRows.length < 3;
		var modalTitle = this.props.params.auditCycleId ? "Edit Client Requirement" : "Add Client Requirement";

		return (
			<Modal modalTitle={modalTitle} onClose={hashHistory.goBack}>
				<form onSubmit={this.onSubmit}>
					<div className='row'>
						<div className="col-md-6">
							<FormDateInput label="Start Date" name="start_date" onChange={this.startDateChanged} value={this.state.start_date} />
						</div>
						<div className="col-md-6">
							<FormDateInput label="End Date" name="end_date" onChange={this.endDateChanged} value={this.state.end_date} />
						</div>
					</div>
					<div className="row">
						<div className="col-md-12">
							<FormInput label="Problem Statement:" type="text" name="problem_statement" value={this.state.problem_statement} onChange={this.fieldChanged} />
						</div>
					</div>

					<div className="row">
						<div className="col-md-6">
							<label>Audit Category:</label>
							<Select
								name="category"
								value={this.state.category ? categoryOptions.filter(obj => this.state.category.includes(obj.value) === true) : null}
								onChange={(e) => this.selectHandleChange(e, "category")}
								options={categoryOptions}
								isMulti={true} />
						</div>
						<div className="col-md-6">
							<label>Questionnaire Type:</label>
							<Select
								name="qtype"
								value={this.state.qtype ? questionaryOptions.filter(obj => this.state.qtype.includes(obj.value) === true) : null}
								onChange={(e) => this.selectHandleChange(e, "qtype")}
								options={questionaryOptions}
								isMulti={true} />
						</div>
					</div>
					<br /><br />
					{canAddMore &&
						<div className="row" style={{ display: "flex", justifyContent: "end" }}>
							<div className="col-md-2">
								<button onClick={this.addAuditRow}><Plus /></button>
							</div>
						</div>
					}
					{auditRows}
					<div className="row">
						<div className="col-md-6">
							<FormInput label="Price Per Audit: (₹)" type="number" name="price_per_audit" onChange={this.fieldChanged} value={this.state.price_per_audit} />
						</div>
						<div className="col-md-6">
							<FormInput label="Setup Fees: (₹)" type="number" name="set_up_fees" onChange={this.fieldChanged} value={this.state.set_up_fees} />
						</div>
					</div>
					<div className="row">
						<div className="col-md-6">
							<FormInput label="Execution Budget: (₹)" type="number" name="execution_budget" onChange={this.fieldChanged} value={this.state.execution_budget} />
						</div>
						<div className="col-md-6">
							<FormTextarea label="Scope of Work:" name="scope_of_work" onChange={this.fieldChanged} value={this.state.scope_of_work} />
						</div>
					</div>
					<div className="row">
						<div className="col-md-6">
							<FormTextarea label="Audit Flow:" name="audit_flow" onChange={this.fieldChanged} value={this.state.audit_flow} />
						</div>
						<div className="col-md-6">
							<FormInput label="Email Address of Project Manager:" type="email" name="project_manager_email" onChange={this.fieldChanged} value={this.state.project_manager_email} />
						</div>
					</div>
					<div className="row">
						<div className="col-md-6">
							<FormInput label="Email Address of Sales Representative:" type="email" name="sales_representative_email" onChange={this.fieldChanged} value={this.state.sales_representative_email} />
						</div>
					</div>
					<FormErrorList errors={this.state.errors.non_field_errors} />
					<SaveButton />
				</form>
			</Modal>
		);
	}
}

