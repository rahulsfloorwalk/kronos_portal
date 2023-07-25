import React from "react";
import PropTypes from "prop-types";
import { hashHistory } from "react-router";
import { getInputEventChangeValue } from "../../../../react_utils.js";
import FormTextarea from "../../../../components/FormTextarea.jsx";
import Modal from "../../../../components/Modal.jsx";
import SaveButton from "../../../../components/SaveButton.jsx";
import FormInput from "../../../../components/FormInput.jsx";
import { saveDetails, updateDetails,findSolutionById,findDetailsbySolutionId } from "../../../service/admin_dashboard.js";

class DetailsForm extends React.Component {
	static propTypes = {
		params: PropTypes.shape({
			solutionId: PropTypes.string.isRequired,
			detailsId: PropTypes.string,
		}),
	};

	state = {
		loading: false,
		details: {
			description: "",
			post_approval_description: "",
			check_points: "",
			audit_fee: 0,
		},
		solution:{},
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
			this.setState(prevState => ({
				details: {
					...prevState.details,
					solution: this.props.params.solutionId
				}
			}));
		}
		if (this.props.params.solutionId) {
			this.setLoading(true);
			findSolutionById(this.props.params.solutionId).then((solution) => {
				this.setState({
					solution: Object.assign({}, solution)
				});
			}).always(() => this.setLoading(false));
		}

		findDetailsbySolutionId(this.props.params.solutionId).then((details) => {
			this.setState({
				details
			});
		});
	}
	fieldChanged = (e) => {
		this.setState({
			details: Object.assign({}, this.state.details, getInputEventChangeValue(e))
		});
	};


	onSubmit = (e) => {
		e.preventDefault();
		if(this.state.details.check_points === ""){
			alert("Fields can not be empty");
		}else{
			if (this.state.details.id) {
				updateDetails(this.state.details.id,this.state.details).then(
					() => {
						hashHistory.push("admindashboard/solution");
					},
					err => {
						if( err.responseJSON){
							this.setState({
								errors: err.responseJSON
							});
						}
					}
				);
			} else {
				saveDetails(this.state.details).then(
					() => {
						hashHistory.push("admindashboard/solution");
					},
					err => {
						if (err.responseJSON) {
							this.setState({
								errors: err.responseJSON
							});
						}
					}
				);
			}
		}
	};
	render() {

		return (
			<Modal modalTitle={"Details"} onClose={hashHistory.goBack}>
				<form onSubmit={this.onSubmit} className="row">
					<div className="col-md-12">
						<FormTextarea label="Description" name="description" value={this.state.details.description} onChange={this.fieldChanged} errors={this.state.errors.description} />
					</div>
					<div className="col-md-12">
						<FormTextarea label="Post Approval Description" name="post_approval_description" value={this.state.details.post_approval_description} onChange={this.fieldChanged} errors={this.state.errors.post_approval_description} />
					</div>
					<div className="col-md-12">
						<FormTextarea label="CheckPoints" name="check_points" onChange={this.fieldChanged} value={this.state.details.check_points} errors={this.state.errors.check_points} />
					</div>
					<div className="col-md-12">
						<FormInput label="Audit Fees(₹)" type="number" value={this.state.details.audit_fee} name="audit_fee" onChange={this.fieldChanged} errors={this.state.errors.audit_fee} />
					</div>
					<div className="col-md-12">
						<SaveButton />
					</div>
				</form>
			</Modal>
		);
	}
}


export default DetailsForm;
