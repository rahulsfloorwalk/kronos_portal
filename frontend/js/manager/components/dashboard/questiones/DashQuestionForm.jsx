import React from "react";
import PropTypes from "prop-types";
import { hashHistory } from "react-router";
import { getInputEventChangeValue } from "../../../../react_utils.js";
import FormInput from "../../../../components/FormInput.jsx";
import FormSelect from "../../../../components/FormSelect.jsx";
import SaveButton from "../../../../components/SaveButton.jsx";
import Modal from "../../../../components/Modal.jsx";
import Loading from "../../../../components/Loading.jsx";
import FormErrorList from "../../../../components/FormErrorList.jsx";
import { getQuestionType } from "../../../../utils.js";
import OptionBuilder from "../../questionnaire/OptionBuilder.jsx";

export default class DashQuestionForm extends React.Component {
    static propTypes = {
        params: PropTypes.shape({
            questionId: PropTypes.string,
        }),
    };
    state = {
        loading: false,
        question : {
        question_txt: "",
        sequence : "",
        max_marks: 0,
        question_type : "",
        comment_required : "",
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
    // componentDidMount() {
    //     if (this.props.params.taxId) {
    //         this.setLoading(true);
    //         findTaxById(this.props.params.taxId).then((tax) => {
    //             this.setState({
    //                 tax: Object.assign({}, tax)
    //             });
    //         }).always(() => this.setLoading(false));
    //     }
    // }

    fieldChanged = (e) => {
        this.setState({
            question: Object.assign({}, this.state.question, getInputEventChangeValue(e))
        });
    };
   
    onSubmit = (e) => {
		e.preventDefault();
        console.log(this.state);
		// saveQuestion(this.state.form).then(
		// 	() => {
		// 		hashHistory.push(`/audit_cycle/${this.props.params.auditCycleId}/questionnaire`);
		// 	},
		// 	err => {
		// 		if( err.responseJSON){
		// 			this.setState({
		// 				errors: err.responseJSON
		// 			});
		// 		}
		// 	}
		// );
	};
    // saveAndNext = (e) => {
	// 	e.preventDefault();
	// 	saveQuestion(this.state.form).then(
	// 		(savedQuestion) => {
	// 			this.setState({
	// 				form: Object.assign({}, this.state.form, {
	// 					sequence: savedQuestion.sequence + 1,
	// 					max_marks: "",
	// 					question_type: "",
	// 					question_txt: "",
	// 					hide_question: false,
	// 					optional_comment_required: false,
	// 				})
	// 			});
	// 			hashHistory.push(this.props.location.pathname);
	// 		},
	// 		(err) => {
	// 			if( err.responseJSON){
	// 				this.setState({
	// 					errors: err.responseJSON
	// 				});
	// 			}
	// 		}
	// 	);
	// };
    optionsChanged = (options) => {
		this.setState({
			question: Object.assign({}, this.state.question, {
				question_data: Object.assign({}, this.state.question.question_data, {
					version: 1,
					options,
				}),
			})
		});
	};
render() {
    if (this.state.loading) {
        return (<Loading />);
    }
    var modalTitle = this.props.params.questionId ? "Edit Question" : "Add Question";
    let optionBuilder;
    let optional_comment_required_div;
    if(this.state.question.question_type === "MUTEX" || this.state.question.question_type === "MULTISELECT"){
        optionBuilder = <OptionBuilder
            options={typeof(this.state.question.question_data) === "object" && Object.keys(this.state.question.question_data).length > 0 ? this.state.question.question_data.options : []}
            onChange={this.optionsChanged}
        />;

       
    }

    // let hide_question_div = (
    //     <div className="col-md-12">
    //         <FormInput label="Hide Question" type="checkbox" checked={this.state.form.hide_question} name="hide_question" onChange={this.inputChanged} errors={this.state.errors.hide_question}/>
    //     </div>
    // );
    return (
        <Modal modalTitle={modalTitle} onClose={hashHistory.goBack}>
        <form onSubmit={this.onSubmit} className="row">
            <FormErrorList errors={this.state.errors.non_field_errors} />
            <div className="col-md-4">
						<FormInput label="Sequence" min="1" type="number" value={this.state.question.sequence} name="sequence" onChange={this.fieldChanged} errors={this.state.errors.sequence}/>
					</div>
                    <div className="col-md-4">
						<FormInput label="Max. Marks" min="0" type="number" value={this.state.question.max_marks} name="max_marks" onChange={this.fieldChanged} errors={this.state.errors.max_marks}/>
					</div>
                    <div className="col-md-4">
						<FormSelect label="Question Type" value={this.state.question.question_type} name="question_type" onChange={this.fieldChanged} errors={this.state.errors.question_type}>
							<option value=""></option>
							<option value="PLAIN">{getQuestionType("PLAIN")}</option>
							<option value="MUTEX">{getQuestionType("MUTEX")}</option>
							<option value="MULTISELECT">{getQuestionType("MULTISELECT")}</option>
						</FormSelect>
					</div>
                    <div className="col-md-12">
						<FormInput label="Question" maxLength="1024" type="text" value={this.state.question.question_txt} name="question_txt" onChange={this.fieldChanged} errors={this.state.errors.question_txt}/>
					</div>
                    <div className="col-md-12">
						{optionBuilder}
					</div>
                    <div className="col-md-12"><SaveButton />&nbsp;
						{/* { ! this.props.params.questionId ?
							<button type="button" className="btn btn-primary" onClick={this.saveAndNext}>Save and Next</button>
							: null } */}
                    </div>
            
        </form>
    </Modal>
    );
}
}
