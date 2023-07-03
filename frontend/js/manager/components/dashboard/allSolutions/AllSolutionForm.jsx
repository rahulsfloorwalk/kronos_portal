import React from "react";
import PropTypes, { bool } from "prop-types";
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

const FieldErrors = PropTypes.arrayOf(PropTypes.string);

export default class AllSolutionForm extends React.Component {
    static propTypes = {
        params: PropTypes.shape({
            solutionId: PropTypes.string,
        }).isRequired,
        solution: PropTypes.shape({
            name:PropTypes.string,
            url_structure:PropTypes.string,
            price: PropTypes.number,
            about: PropTypes.string,
            overview: PropTypes.string,
            how_it_work: PropTypes.string,
            short_description:PropTypes.string,
            execution_time:PropTypes.string,
            category: PropTypes.shape({
                id: PropTypes.number.isRequired,
                name: PropTypes.string.isRequired,
            }),
            sub_category: PropTypes.shape({
                id: PropTypes.number.isRequired,
                name: PropTypes.string.isRequired,
            }),
            tax: PropTypes.shape({
                id: PropTypes.number.isRequired,
                rate: PropTypes.number.isRequired,
            }),
        }),
        errors: PropTypes.shape({
			name: FieldErrors,
			url_structure: FieldErrors,
			price: FieldErrors,
			about: FieldErrors,
			overview: FieldErrors,
			how_it_work: FieldErrors,
			short_description: FieldErrors,
			execution_time: FieldErrors,
			category: FieldErrors,
			sub_category: FieldErrors,
			tax: FieldErrors,
		}).isRequired,

        
    };
    
    state = {
        loading: false,
        categories: [],
        sub_categories: [],
        taxes: [],
        errors: {}
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
            findSolutionById(this.props.params.solutionId).then((solution) => {
                this.setState({
                    solution: Object.assign({}, solution)
                });
            }).always(() => this.setLoading(false));
        }

        findCategories().then((categories) => {
            this.setState({ categories });
        });
        findSubCategories().then((sub_categories) => {
            this.setState({ sub_categories });
        })
        findTaxes().then((taxes) => {
            this.setState({ taxes });
        })
    }

    fieldChanged = (e) => {
        this.setState({
            solution: Object.assign({}, this.state, getInputEventChangeValue(e))
        });
    };

    onSubmit = (e) => {
        e.preventDefault();
        console.log(this.state)
        var promise;
        if (this.props.params.solutionId) {
            promise = updateSolution(
                this.props.params.solutionId,
                this.state
            );
        } else {
            promise = addSolution(
                this.state
            );
        }
        promise.then(function () {
            hashHistory.push("/admindashboard/solution");
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
                ...this.state,
                [editorName]: newContent
            }
        });
    }
    
    render() {
        if (this.state.loading) {
            return (<Loading />);
        }
        var modalTitle = this.props.params.solutionId ? "Edit Solution" : "Add Solution";
        const { solution, categories, sub_categories, taxes,category,sub_category,tax, loading, errors } = this.state;
        console.log(this.solution)
        return (
            <Modal modalTitle={modalTitle} onClose={hashHistory.goBack}>
                <form onSubmit={this.onSubmit}>
                    <FormErrorList errors={this.state.errors.non_field_errors} />
                    <div className="row">
                        <div className="col-md-6">
                            <FormInput label="Solution Name" type="text" value={this.state.name} name="name" onChange={this.fieldChanged} errors={this.state.errors.name} placeholder="Solution Name" />
                        </div>
                        <div className="col-md-6">
                            <FormInput label="URL Structure" type="text" value={this.state.url_structure} name="url_structure" onChange={this.fieldChanged} errors={this.state.errors.url_structure} placeholder="URL Structure" />
                        </div>
                    </div>
                    <div className="row">
                        <div className="col-md-6">
                        <FormSelect
                            label="Category"
                            name="category"
                            value={category}
                            onChange={this.fieldChanged}
                        >
                            <option value=""></option>
                            {categories.map(category => (
                            <option key={category.id} value={category.id}>
                                {category.name}
                            </option>
                            ))}
                        </FormSelect>
                          </div>
                        <div className="col-md-6">
                            <FormSelect label="Sub Category" name="sub_category"
                                value={sub_category}
                                onChange={this.fieldChanged} >
                                <option value=""></option>
                                {sub_categories.map(sub_category => (
                                    <option key={sub_category.id} value={solution.sub_category.id}>
                                    {solution.sub_category.name}
                                    </option>
                                ))}
                              </FormSelect>
                        </div>
                    </div>
                    <div className="row">
                        <div className="col-md-6">
                            <FormInput label="Price" type="text" value={this.state.price} name="price" onChange={this.fieldChanged} errors={this.state.errors.price} placeholder="Price" />
                        </div>
                        <div className="col-md-6">
                            <FormSelect label="Tax" name="tax" 
                            value={tax}
                            onChange={this.fieldChanged} >
                            <option value=""></option>
							{this.state.taxes.map(tax => (
                                    <option key={tax.id}
                                        value={tax.id}
                                
                                    >{tax.name}</option>
                                ))}
                            </FormSelect>
                        </div>
                    </div>
                    <div className="row" style={{ marginTop: "2rem" }}>
                        <div className="col-md-12">
                            <label>About</label>
                            <JoditEditor
                                // ref={this.aboutEditor}
                                name="about"
                                value={this.state.about}
                                onChange={(newContent) => this.handleEditorChange('about', newContent)}
                                errors={this.state.errors.about}
                            />
                        </div>
                    </div>
                    <div className="row" style={{ marginTop: "1rem" }}>
                        <div className="col-md-12">
                            <label>Overview</label>
                            <JoditEditor
                                // ref={this.overviewEditor}
                                name="overview"
                                value={this.state.overview}
                                onChange={(newContent) => this.handleEditorChange('overview', newContent)}
                                errors={this.state.errors.overview}
                            />
                        </div>
                    </div>
                    <div className="row" style={{ marginTop: "2rem" }}>
                        <div className="col-md-12">
                            <label>How it Works</label>
                            <JoditEditor
                                // ref={this.howItWorkEditor}
                                name="how_it_work"
                                value={this.state.how_it_work}
                                onChange={(newContent) => this.handleEditorChange('how_it_work', newContent)}
                                errors={this.state.errors.how_it_work}
                            />
                        </div>
                    </div>
                    <div className="row" style={{ marginTop: "2rem" }}>
                        <div className="col-md-12">
                            <label>Execution Time</label>
                            <JoditEditor
                                // ref={this.executionTimeEditor}
                                name="execution_time"
                                value={this.state.execution_time}
                                onChange={(newContent) => this.handleEditorChange('execution_time', newContent)}
                                errors={this.state.errors.execution_time}
                            />
                        </div>
                    </div>
                    <div className="row" style={{ marginTop: "2rem" }}>
                        <div className="col-md-12">
                            <label>Short Description</label>
                            <JoditEditor
                                // ref={this.shortDescEditor}
                                name="short_description"
                                value={this.state.short_description}
                                onChange={(newContent) => this.handleEditorChange('short_description', newContent)}
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
