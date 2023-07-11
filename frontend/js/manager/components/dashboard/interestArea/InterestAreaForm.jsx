import React from "react";
import PropTypes from "prop-types";
import { hashHistory } from "react-router";
import { findInterestAreaById, updateInterestArea, addInterestArea} from "../../../service/admin_dashboard.js";
import { getInputEventChangeValue } from "../../../../react_utils.js";
import FormInput from "../../../../components/FormInput.jsx";
import SaveButton from "../../../../components/SaveButton.jsx";
import Modal from "../../../../components/Modal.jsx";
import Loading from "../../../../components/Loading.jsx";
import FormErrorList from "../../../../components/FormErrorList.jsx";

export default class IndustryForm extends React.Component {
	static propTypes = {
		params: PropTypes.shape({
			interestareaId: PropTypes.string,
		}),
	};

	state = {
		loading: false,
		interestarea: {
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
		if (this.props.params.interestareaId) {
			this.setLoading(true);
			findInterestAreaById(this.props.params.interestareaId).then((interestarea) => {
				this.setState({
					interestarea: Object.assign({}, interestarea)
				});
			}).always(() => this.setLoading(false));
		}
	}

	fieldChanged = (e) => {
		this.setState({
			interestarea: Object.assign({}, this.state.interestarea, getInputEventChangeValue(e))
		});
	};

	onSubmit = (e) => {
		e.preventDefault();
		var promise;
		if (this.props.params.interestareaId) {
			promise = updateInterestArea(
				this.props.params.interestareaId,
				this.state.interestarea.name,
			);
		} else {
			promise = addInterestArea(
				this.state.interestarea.name,
			);
		}
		promise.then(function () {
			hashHistory.push("/admindashboard/interested_area");
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
		var modalTitle = this.props.params.interestareaId ? "Edit Interest Area" : "Add Interest Area";
		return (
			<Modal modalTitle={modalTitle} onClose={hashHistory.goBack}>
				<form onSubmit={this.onSubmit}>
					<FormErrorList errors={this.state.errors.non_field_errors} />
					<FormInput label="Interest Area Name" type="text" value={this.state.interestarea.name} name="name" onChange={this.fieldChanged} errors={this.state.errors.name} placeholder="Interest Area Name" />
					<SaveButton />
				</form>
			</Modal>
		);
	}
}
