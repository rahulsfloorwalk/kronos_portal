import React from "react";
import PropTypes from "prop-types";
import { hashHistory } from "react-router";
import { findSolutionById, updateSolution, addSolution, findCategories, findTaxes } from "../../../service/admin_dashboard.js";
import { getInputEventChangeValue } from "../../../../react_utils.js";
import FormInput from "../../../../components/FormInput.jsx";
import FormSelect from "../../../../components/FormSelect.jsx";
import SaveButton from "../../../../components/SaveButton.jsx";
import Modal from "../../../../components/Modal.jsx";
import Loading from "../../../../components/Loading.jsx";
import FormErrorList from "../../../../components/FormErrorList.jsx";
import JoditEditor from "jodit-react";
import Alert from "react-s-alert";
import Select from "react-select";
import "../../../../../css/bs_overrides.scss";
import { getAuditType } from "../../../../utils.js";
export default class AllSolutionForm extends React.Component {
	static propTypes = {
		params: PropTypes.shape({
			solutionId: PropTypes.string,
		}),
		category: PropTypes.arrayOf(
			PropTypes.shape({
				value: PropTypes.number,
				label: PropTypes.string,
			})
		),
		tax: PropTypes.shape({
			id: PropTypes.number.isRequired,
			rate: PropTypes.number.isRequired,
			name: PropTypes.string.isRequired,
		}),
	};

	state = {
		loading: false,
		solution: {
			name: "",
			url_structure: "",
			price_INR: 0,
			price_USD: 0,
			category: [],
			tax: "",
			audit_type:"",
			overview: "",
			how_it_work: "",
			execution_time: "",
			short_description: "",
		},
		categories: [],
		taxes: [],
		uploadedFiles: [],
		fileObjects: [],
		errors: {

		}
	};

	setLoading = (loadingState) => {
		this.setState((prevState) => {
			return Object.assign({}, prevState, {
				loading: loadingState
			});
		});
	};

	componentDidMount() {
		if (this.props.params.solutionId) {
			this.setLoading(true);
			findSolutionById(this.props.params.solutionId)
				.then((solution) => {
					this.setState({
						solution: {
							...solution,
							category: solution.categories.map((category) => category.id),
							tax: solution.tax.id,
						},
						categories:[...solution.categories]
					});
					//   console.log("state solution",this.state.categories)
				})
				.always(() => this.setLoading(false));
		}

		findCategories().then((categories) => {
			this.setState({ categories });
		});
		// console.log("mount",this.state.categories)
		findTaxes().then((taxes) => {
			this.setState({ taxes });
		});
	}


	fieldChanged = (e) => {
		this.setState({
			solution: Object.assign({}, this.state.solution, getInputEventChangeValue(e))
		});
	};

	onSubmit = (e) => {
		e.preventDefault();
		var promise;
		if (this.state.solution.overview === "" || this.state.solution.execution_time === "" || this.state.solution.how_it_work === "" || this.state.solution.short_description === "" || this.state.solution.category === "" || this.state.solution.tax === "") {
			alert("fields can not be empty");
		} else {
			if (this.props.params.solutionId) {
				promise = updateSolution(
					this.props.params.solutionId,
					this.state.solution,
				);
				promise.then(function () {
					hashHistory.push("/admindashboard/solution");
					Alert.success("Solution Updated");
				}, (errors) => {
					if (errors.responseJSON) {
						this.setState({
							errors: errors.responseJSON
						});
					}
				});
			} else {
				promise = addSolution(
					this.state.solution,
				);
				promise.then(function () {
					hashHistory.push("/admindashboard/solution");
					Alert.success("Solution Added");
				}, (errors) => {
					if (errors.responseJSON) {
						this.setState({
							errors: errors.responseJSON
						});
					}
				});
			}
		}
	};

	handleEditorChange = (editorName, newContent) => {
		this.setState({
			solution: {
				...this.state.solution,
				[editorName]: newContent
			}
		});
	};
	selectHandleChange = (selectedValues, field_name) => {
		let selected_category_ids = selectedValues.map((val) => val.value);
		this.setState((prevState) => ({
			solution: {
				...prevState.solution,
				[field_name]: selected_category_ids,
			},
		}));
	};


	render() {
		if (this.state.loading) {
			return (<Loading />);
		}
		var modalTitle = this.props.params.solutionId ? "Edit Solution" : "Add Solution";
		// console.log('163', this.state.categories)
		return (
			<Modal modalTitle={modalTitle} onClose={hashHistory.goBack}>
				<form onSubmit={this.onSubmit}>
					<FormErrorList errors={this.state.errors.non_field_errors} />
					<div className="row">
						<div className="col-md-6">
							<FormInput label="Solution Name" type="text" value={this.state.solution.name} name="name" onChange={this.fieldChanged} errors={this.state.errors.name} placeholder="Solution Name" />
						</div>
						<div className="col-md-6">
							<FormInput label="URL Structure" type="text" value={this.state.solution.url_structure} name="url_structure" onChange={this.fieldChanged} errors={this.state.errors.url_structure} placeholder="URL Structure" />
						</div>
					</div>
					<div className="row">
						<div className="col-md-6">
							<FormInput label="Price (INR)" type="text" value={this.state.solution.price_INR} name="price_INR" onChange={this.fieldChanged} errors={this.state.errors.price_INR} placeholder="Price in INR" />
						</div>
						<div className="col-md-6">
							<FormInput label="Price (USD)" type="text" value={this.state.solution.price_USD} name="price_USD" onChange={this.fieldChanged} errors={this.state.errors.price_USD} placeholder="Price in USD" />
						</div>

					</div>
					<div className="row">
						<div className="col-md-12">
							<FormSelect label="Audit Type" value={this.state.solution.audit_type} name="audit_type" onChange={this.fieldChanged} errors={this.state.errors.audit_type}>
								<option value=""></option>
								<option value="WALKIN">{getAuditType("WALKIN")}</option>
								<option value="PHONE">{getAuditType("PHONE")}</option>
								<option value="WEB">{getAuditType("WEB")}</option>
								<option value="VISIBILITY">{getAuditType("VISIBILITY")}</option>
								<option value="COMPETITION">{getAuditType("COMPETITION")}</option>
								<option value="SERVICE">{getAuditType("SERVICE")}</option>
								<option value="SALES">{getAuditType("SALES")}</option>
								<option value="SMAAASH_ARENA">{getAuditType("SMAAASH_ARENA")}</option>
								<option value="FINE_DINE">{getAuditType("FINE_DINE")}</option>
								<option value="SKY_KARTING">{getAuditType("SKY_KARTING")}</option>
								<option value="GENERAL">{getAuditType("GENERAL")}</option>
								<option value="SMAAASH">{getAuditType("SMAAASH")}</option>
								<option value="SMAAASH_MEGA">{getAuditType("SMAAASH_MEGA")}</option>
								<option value="SMAAASH_ZONE">{getAuditType("SMAAASH_ZONE")}</option>
								<option value="DDC">{getAuditType("DDC")}</option>
								<option value="HTC">{getAuditType("HTC")}</option>
								<option value="ASCVD">{getAuditType("ASCVD")}</option>
								<option value="SKIN_HYDRATION">{getAuditType("SKIN_HYDRATION")}</option>
								<option value="HYPER_PIGMENTATION">{getAuditType("HYPER_PIGMENTATION")}</option>
								<option value="SKIN_SENSITIVE">{getAuditType("SKIN_SENSITIVE")}</option>
								<option value="RETAIL">{getAuditType("RETAIL")}</option>
							</FormSelect>
						</div>
					</div>
					<div className="row">
						<div className="col-md-12" style={{ marginBottom: "10px" }}>
							<label>Category</label>
							<Select
								name="category"
								value={this.state.solution.category.map((categoryId) => ({
									value: categoryId,
									label: this.state.categories.find((category) => category.id === categoryId).name,
								}))}
								onChange={(selectedValues) => this.selectHandleChange(selectedValues, "category")}
								options={this.state.categories.map((category) => ({
									value: category.id,
									label: category.name,
								}))}
								isMulti={true}
							/>
						</div>
					</div>
					<div className="row">
						<div className="col-md-12">
							<FormSelect
								label="Tax"
								name="tax"
								value={this.state.solution.tax}
								onChange={this.fieldChanged}
							>
								<option value="">----------</option>
								{this.state.taxes.map((tax) => (
									<option key={tax.id} value={tax.id}>
										{tax.name}
									</option>
								))}
							</FormSelect>
						</div>
					</div>
					<div className="row" style={{ marginTop: "1rem" }}>
						<div className="col-md-12">
							<label>Overview</label>
							<JoditEditor
								name="overview"
								value={this.state.solution.overview}
								onChange={(newContent) => this.handleEditorChange("overview", newContent)}
								errors={this.state.errors.overview}
							/>
						</div>
					</div>
					<div className="row" style={{ marginTop: "2rem" }}>
						<div className="col-md-12">
							<label>How it Works</label>
							<JoditEditor
								name="how_it_work"
								value={this.state.solution.how_it_work}
								onChange={(newContent) => this.handleEditorChange("how_it_work", newContent)}
								errors={this.state.errors.how_it_work}
							/>
						</div>
					</div>
					<div className="row" style={{ marginTop: "2rem" }}>
						<div className="col-md-12">
							<label>Execution Time</label>
							<JoditEditor
								name="execution_time"
								value={this.state.solution.execution_time}
								onChange={(newContent) => this.handleEditorChange("execution_time", newContent)}
								errors={this.state.errors.execution_time}
							/>
						</div>
					</div>
					<div className="row" style={{ marginTop: "2rem", marginBottom: "2rem" }}>
						<div className="col-md-12">
							<label>Short Description</label>
							<JoditEditor
								name="short_description"
								value={this.state.solution.short_description}
								onChange={(newContent) => this.handleEditorChange("short_description", newContent)}
								errors={this.state.errors.short_description}
							/>
						</div>
					</div>
					<SaveButton />
				</form>
			</Modal>
		);
	}
}
