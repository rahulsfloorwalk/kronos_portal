import React from "react";
import PropTypes from "prop-types";
import { hashHistory } from "react-router";
import { findIndustryById, updateIndustry, addIndustry } from "../../../service/admin_dashboard.js";
import { getInputEventChangeValue } from "../../../../react_utils.js";
import FormInput from "../../../../components/FormInput.jsx";
import SaveButton from "../../../../components/SaveButton.jsx";
import Modal from "../../../../components/Modal.jsx";
import Loading from "../../../../components/Loading.jsx";
import FormErrorList from "../../../../components/FormErrorList.jsx";

export default class IndustryForm extends React.Component {
	static propTypes = {
		params: PropTypes.shape({
			industryId: PropTypes.string,
		}),
	};

	state = {
		loading: false,
		industry: {
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
		if (this.props.params.industryId) {
			this.setLoading(true);
			findIndustryById(this.props.params.industryId).then((industry) => {
				this.setState({
					industry: Object.assign({}, industry)
				});
			}).always(() => this.setLoading(false));
		}
	}

	fieldChanged = (e) => {
		this.setState({
			industry: Object.assign({}, this.state.industry, getInputEventChangeValue(e))
		});
	};

	onSubmit = (e) => {
		e.preventDefault();
		var promise;
		if (this.props.params.industryId) {
			promise = updateIndustry(
				this.props.params.industryId,
				this.state.industry.name,
			);
		} else {
			promise = addIndustry(
				this.state.industry.name,
			);
		}
		promise.then(function () {
			hashHistory.push("/admindashboard/industry");
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
		var modalTitle = this.props.params.industryId ? "Edit Industry" : "Add Industry";
		return (
			<Modal modalTitle={modalTitle} onClose={hashHistory.goBack}>
				<form onSubmit={this.onSubmit}>
					<FormErrorList errors={this.state.errors.non_field_errors} />
					<FormInput label="Industry Name" type="text" value={this.state.industry.name} name="name" onChange={this.fieldChanged} errors={this.state.errors.name} placeholder="Industry Name" />
					<SaveButton />
				</form>
			</Modal>
		);
	}
}
