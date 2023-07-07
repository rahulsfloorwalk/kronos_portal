import React from "react";
import PropTypes from "prop-types";
import { hashHistory } from "react-router";
import { findById, updateCategory, addCategory } from "../../../service/admin_dashboard.js";
import { getInputEventChangeValue } from "../../../../react_utils.js";
import FormInput from "../../../../components/FormInput.jsx";
import SaveButton from "../../../../components/SaveButton.jsx";
import Modal from "../../../../components/Modal.jsx";
import Loading from "../../../../components/Loading.jsx";
import FormErrorList from "../../../../components/FormErrorList.jsx";

export default class CategoryForm extends React.Component {
	static propTypes = {
		params: PropTypes.shape({
			categoryId: PropTypes.string,
		}),
	};

	state = {
		loading: false,
		category_name: {
			name: "",
		},
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
		if (this.props.params.categoryId) {
			this.setLoading(true);
			findById(this.props.params.categoryId).then((category_name) => {
				this.setState({
					category_name: Object.assign({}, category_name)
				});
			}).always(() => this.setLoading(false));
		}
	}

	fieldChanged = (e) => {
		this.setState({
			category_name: Object.assign({}, this.state.category_name, getInputEventChangeValue(e))
		});
	};

	onSubmit = (e) => {
		e.preventDefault();
		var promise;
		if (this.props.params.categoryId) {
			promise = updateCategory(
				this.props.params.categoryId,
				this.state.category_name.name,
			);
		} else {
			promise = addCategory(
				this.state.category_name.name,
			);
		}
		promise.then(function () {
			hashHistory.push("/admindashboard/category");
		}, (errors) => {
			if (errors.responseJSON) {
				this.setState({
					errors: errors.responseJSON
				});
			}
		});
	};

	render() {
		if (this.state.loading) {
			return (<Loading />);
		}
		var modalTitle = this.props.params.categoryId ? "Edit Category" : "Add Category";
		return (
			<Modal modalTitle={modalTitle} onClose={hashHistory.goBack}>
				<form onSubmit={this.onSubmit}>
					<FormErrorList errors={this.state.errors.non_field_errors} />
					<FormInput label="Category Name" type="text" value={this.state.category_name.name} name="name" onChange={this.fieldChanged} errors={this.state.errors.name} placeholder="Category Name" />
					<SaveButton />
				</form>
			</Modal>
		);
	}
}
