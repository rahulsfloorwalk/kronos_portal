import React from "react";
import PropTypes from "prop-types";
import { hashHistory } from "react-router";
import { findSolutionById, updateSolution, addSolution, findCategories, findSubCategories, findTaxes } from "../../../service/admin_dashboard.js";
import { getInputEventChangeValue } from "../../../../react_utils.js";
import FormInput from "../../../../components/FormInput.jsx";
import FormSelect from "../../../../components/FormSelect.jsx";
import SaveButton from "../../../../components/SaveButton.jsx";
import Modal from "../../../../components/Modal.jsx";
import Loading from "../../../../components/Loading.jsx";
import FormErrorList from "../../../../components/FormErrorList.jsx";
import JoditEditor from "jodit-react";
import Alert from "react-s-alert";

export default class AllSolutionForm extends React.Component {
	static propTypes = {
		params: PropTypes.shape({
			solutionId: PropTypes.string,
		}),
		category: PropTypes.shape({
			id: PropTypes.number.isRequired,
			name: PropTypes.string.isRequired,
		}),
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
			price: 0,
			category: "",
			tax: "",
			overview: "",
			how_it_work: "",
			execution_time: "",
			short_description: "",
		},
		categories: [],
		sub_categories: [],
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
							category: solution.category.id, //for pre-filled values
							tax: solution.tax.id,
						},
					});
				})
				.always(() => this.setLoading(false));
		}

		findCategories().then((categories) => {
			this.setState({ categories });
		});
		findSubCategories().then((sub_categories) => {
			this.setState({ sub_categories });
		});
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
		if(this.state.solution.overview === "" || this.state.solution.execution_time === "" || this.state.solution.how_it_work === "" || this.state.solution.short_description === "" || this.state.solution.category === "" || this.state.solution.tax === "" || this.state.solution.price === ""){
			alert("No fields can be empty");
		}
		var promise;
		if (this.props.params.solutionId) {
			promise = updateSolution(
				this.props.params.solutionId,
				this.state.solution,
			);
		} else {
			promise = addSolution(
				this.state.solution,
			);
		}
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

	};

	handleEditorChange = (editorName, newContent) => {
		this.setState({
			solution: {
				...this.state.solution,
				[editorName]: newContent
			}
		});
	};

	render() {
		if (this.state.loading) {
			return (<Loading />);
		}
		var modalTitle = this.props.params.solutionId ? "Edit Solution" : "Add Solution";

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
						<div className="col-md-12">
							<FormSelect
								label="Category"
								name="category"
								value={this.state.solution.category}
								onChange={this.fieldChanged}
							>
								<option value="">----------</option>
								{this.state.categories.map((category) => (
									<option key={category.id} value={category.id}>
										{category.name}
									</option>
								))}
							</FormSelect>
						</div>
					</div>
					<div className="row">
						<div className="col-md-6">
							<FormInput label="Price" type="text" value={this.state.solution.price} name="price" onChange={this.fieldChanged} errors={this.state.errors.price} placeholder="Price" />
						</div>
						<div className="col-md-6">
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
