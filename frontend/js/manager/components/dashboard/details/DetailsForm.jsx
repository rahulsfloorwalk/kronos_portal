import React from "react";
import PropTypes from "prop-types";
import * as ReactRedux from "react-redux";
import { hashHistory } from "react-router";
import $ from "jquery";
import Alert from "react-s-alert";
import { getInputEventChangeValue } from "../../../../react_utils.js";
import FormTextarea from "../../../../components/FormTextarea.jsx";
import Modal from "../../../../components/Modal.jsx";
import SaveButton from "../../../../components/SaveButton.jsx";
import FormInput from "../../../../components/FormInput.jsx";

class DetailsForm extends React.Component{
	static propTypes = {
		params: PropTypes.shape({
			solutionId: PropTypes.string.isRequired,
		}),
	};

	constructor(props){
		super(props);
		this.state = {
            details : {
                description : "",
                post_approval_description : "",
                check_points : "",
                audit_fees : 0,
            },
			errors: {
            }
		};
	}

	// componentDidMount() {
	// }

	// fieldChanged = (e) => {
	// 	affectInputEventToComponent(e, this);
	// };

    fieldChanged = (e) => {
        this.setState({
            details: Object.assign({}, this.state.details, getInputEventChangeValue(e))
        });
    };

	onSubmit = (e) => {
		e.preventDefault();
        console.log(this.state)
	};

	render(){
	
		return (
			<Modal modalTitle={"Proofs Tag"} size="modal-md" onClose={hashHistory.goBack}>
				<form onSubmit={this.onSubmit}>
                <div className="col-md-12">
                <FormTextarea label="Description" name="description" value={this.state.details.description} onChange={this.fieldChanged} errors={this.state.errors.description}/>
                </div>
                <div className="col-md-12">
                <FormTextarea label="Post Approval Description" name="post_approval_description" value={this.state.details.post_approval_description} onChange={this.fieldChanged} errors={this.state.errors.post_approval_description}/>
                </div>
                <div className="col-md-12">
                <FormTextarea label="CheckPoints" name="check_points" onChange={this.fieldChanged} value={this.state.details.check_points} errors={this.state.errors.check_points}/>
                </div>
                <div className="col-md-12">
                <FormInput label="Audit Fees(₹)" type="number" value={this.state.details.audit_fees} name="audit_fees" onChange={this.fieldChanged} errors={this.state.errors.audit_fees}/>
                </div>
                <div className="col-md-12">
					<SaveButton/>
                    </div>
				</form>
			</Modal>
		);
	}
}


export default DetailsForm;
