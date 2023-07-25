import React from "react";
import PropTypes from "prop-types";
import { hashHistory } from "react-router";
import { findCategoryById, updateCategory, addCategory } from "../../../service/admin_dashboard.js";
import { getInputEventChangeValue } from "../../../../react_utils.js";
import FormInput from "../../../../components/FormInput.jsx";
import SaveButton from "../../../../components/SaveButton.jsx";
import Modal from "../../../../components/Modal.jsx";
import Loading from "../../../../components/Loading.jsx";
import FormErrorList from "../../../../components/FormErrorList.jsx";
import JoditEditor from "jodit-react";
import Alert from "react-s-alert";

export default class CategoryForm extends React.Component {
	static propTypes = {
		params: PropTypes.shape({
			categoryId: PropTypes.string,
		}),
		// errors: PropTypes.shape({
		// 	overview: PropTypes.arrayOf(PropTypes.string),
		// 	short_description: PropTypes.arrayOf(PropTypes.string),
		// 	non_field_errors: PropTypes.arrayOf(PropTypes.string),
		// }),
	};

	state = {
		loading: false,
		category: {
			name: "",
			url_structure: "",
			overview: "",
			short_description: "",
		},
		errors: {},
	};

	setLoading = (loadingState) => {
		this.setState((prevState) => {
			return Object.assign({}, prevState, {
				loading: loadingState
			});
		});
	};

	componentDidMount() {
		if (this.props.params.categoryId) {
			this.setLoading(true);
			findCategoryById(this.props.params.categoryId).then((category) => {
				this.setState({
					category: Object.assign({}, category),
				});
			}).always(() => this.setLoading(false));
		}
	}

	fieldChanged = (e) => {
		this.setState({
			category: Object.assign({}, this.state.category, getInputEventChangeValue(e)),
		});
	};
	handleEditorChange = (editorName, newContent) => {
		this.setState({
			category: {
				...this.state.category,
				[editorName]: newContent
			}
		});
	};
	onSubmit = (e) => {
		e.preventDefault();
		var promise;
		if (this.state.category.overview === "" || this.state.category.short_description === "") {
			alert("Fields can not be emty");
		}
		if (this.props.params.categoryId) {
			promise = updateCategory(
				this.props.params.categoryId,
				this.state.category
			);
		} else {
			promise = addCategory(
				this.state.category
			);
		}
		promise.done(function () {
			hashHistory.push("/admindashboard/category");
			Alert.success("Category Added");
		}).fail((err) => {
			this.setState({
				errors: err.responseJSON || {},
			});
		});
	};

	render() {
		if (this.state.loading) {
			return (<Loading />);
		}
		var modalTitle = this.props.params.categoryId ? "Edit Category" : "Add Category";
		return (
			<Modal modalTitle={modalTitle} onClose={hashHistory.goBack}>
				<form onSubmit={this.onSubmit} >
					<FormErrorList errors={this.state.errors.non_field_errors} />
					<div className="row">
						<div className="col-md-6">
							<FormInput label="Category Name" type="text" value={this.state.category.name} name="name" onChange={this.fieldChanged} errors={this.state.errors.name} placeholder="Category Name" />
						</div>
						<div className="col-md-6">
							<FormInput label="URL Structure" type="text" value={this.state.category.url_structure} name="url_structure" onChange={this.fieldChanged} errors={this.state.errors.url_structure} placeholder="URL Structure" />
						</div>
					</div>
					<div className="row" style={{ marginTop: "1rem" }}>
						<div className="col-md-12">
							<label>Overview</label>
							<JoditEditor
								name="overview"
								value={this.state.category.overview}
								onChange={(newContent) => this.handleEditorChange("overview", newContent)}
								errors={this.state.errors.overview}
							/>
						</div>
						{/* <FormErrorList errors={this.props.errors.overview}/> */}
					</div>
					<div className="row" style={{ marginTop: "2rem", marginBottom: "2rem" }}>
						<div className="col-md-12">
							<label>Short Description</label>
							<JoditEditor
								name="short_description"
								value={this.state.category.short_description}
								onChange={(newContent) => this.handleEditorChange("short_description", newContent)}
								errors={this.state.errors.short_description}
							/>
						</div>
						{/* <FormErrorList errors={this.props.errors.short_description}/> */}
					</div>
					<SaveButton />
				</form>
			</Modal>
		);
	}
}