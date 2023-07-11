import React from "react";
import PropTypes from "prop-types";
import { hashHistory } from "react-router";
import { findSubCategoryById, updateSubCategory, addSubCategory } from "../../../service/admin_dashboard.js";
import { getInputEventChangeValue } from "../../../../react_utils.js";
import FormInput from "../../../../components/FormInput.jsx";
import SaveButton from "../../../../components/SaveButton.jsx";
import Modal from "../../../../components/Modal.jsx";
import Loading from "../../../../components/Loading.jsx";
import FormErrorList from "../../../../components/FormErrorList.jsx";

export default class SubCategoryForm extends React.Component {
	static propTypes = {
		params: PropTypes.shape({
			subcategoryId: PropTypes.string,
		}),
	};

	state = {
		loading: false,
		sub_category_name: {
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
		if (this.props.params.subcategoryId) {
			this.setLoading(true);
			findSubCategoryById(this.props.params.subcategoryId).then((sub_category_name) => {
				this.setState({
					sub_category_name: Object.assign({}, sub_category_name)
				});
			}).always(() => this.setLoading(false));
		}
	}

	fieldChanged = (e) => {
		this.setState({
			sub_category_name: Object.assign({}, this.state.sub_category_name, getInputEventChangeValue(e))
		});
	};

	onSubmit = (e) => {
		e.preventDefault();
		var promise;
		if (this.props.params.subcategoryId) {
			promise = updateSubCategory(
				this.props.params.subcategoryId,
				this.state.sub_category_name.name,
			);
		} else {
			promise = addSubCategory(
				this.state.sub_category_name.name,
			);
		}
		promise.then(function () {
			hashHistory.push("/admindashboard/subcategory");
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
		var modalTitle = this.props.params.subcategoryId ? "Edit Sub-Category" : "Add Sub-Category";
		return (
			<Modal modalTitle={modalTitle} onClose={hashHistory.goBack}>
				<form onSubmit={this.onSubmit}>
					<FormErrorList errors={this.state.errors.non_field_errors} />
					<FormInput label="Sub-Category Name" type="text" value={this.state.sub_category_name.name} name="name" onChange={this.fieldChanged} errors={this.state.errors.name} placeholder="Sub-Category Name" />
					<SaveButton />
				</form>
			</Modal>
		);
	}
}
