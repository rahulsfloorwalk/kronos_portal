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
import { Paperclip,Cross } from "../../../../components/Icons.jsx";

export default class AllSolutionForm extends React.Component {
    static propTypes = {
        params: PropTypes.shape({
            solutionId: PropTypes.string,
        }),
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
    };
    overviewEditor = React.createRef();
    howItWorkEditor = React.createRef();
    executionTimeEditor = React.createRef();
    shortDescEditor = React.createRef();

    state = {
        loading: false,
        solution: {
            name: "",
            url_structure: "",
            price: 0,
            // category: "",
            // sub_category: "",
            // tax: "",
            about: "",
            overview: "",
            how_it_work: "",
            execution_time: "",
            short_description: "",
            is_active: true,
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
            solution: Object.assign({}, this.state.solution, getInputEventChangeValue(e))
        });
    };

    onSubmit = (e) => {
        e.preventDefault();
        console.log(this.state.solution)
        var promise;
        if (this.props.params.solutionId) {
            promise = updateSolution(
                this.props.params.solutionId,
                this.state.solution.name,
                this.state.solution.url_structure,
                this.state.solution.price,
                this.state.solution.category,
                this.state.solution.sub_category,
                this.state.solution.tax,
                this.state.solution.about,
                this.state.solution.overview,
                this.state.solution.how_it_work,
                this.state.solution.execution_time,
                this.state.solution.short_description,
                this.state.solution.is_active
            );
        } else {
            promise = addSolution(
                this.state.solution.name,
                this.state.solution.url_structure,
                this.state.solution.price,
                this.state.solution.category,
                this.state.solution.sub_category,
                this.state.solution.tax,
                this.state.solution.about,
                this.state.solution.overview,
                this.state.solution.how_it_work,
                this.state.solution.execution_time,
                this.state.solution.short_description,
                this.state.solution.is_active
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
                ...this.state.solution,
                [editorName]: newContent
            }
        });
    }
  

    uploadButtonClicked = () => {
        this.uploadInput.click();
    };
    handleFileUpload = (e) => {
        const files = Array.from(e.target.files);
        this.setState({
            uploadedFiles: files.map((file) => file.name),
            fileObjects: files,
        });
    };
    handleFileDelete = (index) => {
        const updatedFiles = [...this.state.uploadedFiles];
        const updatedFileObjects = [...this.state.fileObjects];
        updatedFiles.splice(index, 1);
        updatedFileObjects.splice(index, 1);
        this.setState({
            uploadedFiles: updatedFiles,
            fileObjects: updatedFileObjects,
        });
    };
    render() {
        if (this.state.loading) {
            return (<Loading />);
        }
        var modalTitle = this.props.params.solutionId ? "Edit Solution" : "Add Solution";
        const { solution, categories, sub_categories, taxes, loading, errors } = this.state;
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
                        <div className="col-md-6">
                            <FormSelect label="Category" name="category"
                             value={this.state.solution.category} 
                            // value={this.state.solution.category ? this.state.solution.category.id : ""}
                            // value={JSON.stringify(solution.category)}
                             onChange={this.fieldChanged} >
                                <option value="">----------</option>
                                {this.state.categories.map(category => (
                                    <option key={category.id} 
                                    // value={JSON.stringify(category)}
                                    value={category}
                                    >{category.name}</option>
                                ))}
                            </FormSelect>
                        </div>
                        <div className="col-md-6">
                            <FormSelect label="Sub Category" name="sub_category" 
                            value={this.state.solution.sub_category} 
                            // value={this.state.solution.sub_category ? this.state.solution.sub_category.id : ""}
                            // value={JSON.stringify(solution.sub_category)}
                            onChange={this.fieldChanged} >
                                <option value="">----------</option>
                                {this.state.sub_categories.map(sub_category => (
                                    <option key={sub_category.id} 
                                    // value={JSON.stringify(sub_category)}
                                    value={sub_category}
                                    >{sub_category.name}</option>
                                ))}
                            </FormSelect>
                        </div>
                    </div>
                    <div className="row">
                        <div className="col-md-6">
                            <FormInput label="Price" type="text" value={this.state.solution.price} name="price" onChange={this.fieldChanged} errors={this.state.errors.price} placeholder="Price" />
                        </div>
                        <div className="col-md-6">
                            <FormSelect label="Tax" name="tax" 
                            value={this.state.solution.tax} 
                            // value={this.state.solution.tax ? this.state.solution.tax.id : ""}
                            // value={JSON.stringify(solution.tax)}
                            onChange={this.fieldChanged} >
                                <option value="">----------</option>
                                {this.state.taxes.map(tax => (
                                    <option key={tax.id} 
                                    // value={JSON.stringify(tax)}
                                    value={tax}
                                    >{tax.name}</option>
                                ))}
                            </FormSelect>
                        </div>
                    </div>
                    <div className="row" style={{ marginTop: "1rem" }}>
                        <div className="col-md-12">
                            <label>Overview</label>
                            <JoditEditor
                                ref={this.overviewEditor}
                                name="overview"
                                value={this.state.solution.overview}
                                onChange={(newContent) => this.handleEditorChange('overview', newContent)}
                                errors={this.state.errors.overview}
                            />
                        </div>
                    </div>
                    <div className="row" style={{ marginTop: "2rem" }}>
                        <div className="col-md-12">
                            <label>How it Works</label>
                            <JoditEditor
                                ref={this.howItWorkEditor}
                                name="how_it_work"
                                value={this.state.solution.how_it_work}
                                onChange={(newContent) => this.handleEditorChange('how_it_work', newContent)}
                                errors={this.state.errors.how_it_work}
                            />
                        </div>
                    </div>
                    <div className="row" style={{ marginTop: "2rem" }}>
                        <div className="col-md-12">
                            <label>Execution Time</label>
                            <JoditEditor
                                ref={this.executionTimeEditor}
                                name="execution_time"
                                value={this.state.solution.execution_time}
                                onChange={(newContent) => this.handleEditorChange('execution_time', newContent)}
                                errors={this.state.errors.execution_time}
                            />
                        </div>
                    </div>
                    <div className="row" style={{ marginTop: "2rem" }}>
                        <div className="col-md-12">
                            <label>Short Description</label>
                            <JoditEditor
                                ref={this.shortDescEditor}
                                name="short_description"
                                value={this.state.solution.short_description}
                                onChange={(newContent) => this.handleEditorChange('short_description', newContent)}
                                errors={this.state.errors.short_description}
                            />
                        </div>
                    </div>
                    <div className="row">
                        <div className="col-md-12" style={{ margin: "2rem 0rem" }}>
                            <label>Featured Image</label>
                            <input type="file"
                                multiple
                                accept="image/*"
                                onChange={this.handleFileUpload}
                                style={{ width: "100%", border: "1px solid #eee", padding: "1rem" }}
                            />
                            {this.state.uploadedFiles.length > 0 ? (
                                <ul style={{display:"flex",justifyContent:"flex-start",gap:"1rem",flexWrap:"wrap",}}>
                                    {this.state.uploadedFiles.map((name, index) => (
                                        <li key={index} style={{border:"1px solid #eee",listStyle:"none",padding:".5rem"}}>
                                            {name}
                                            <button
                                                onClick={() => this.handleFileDelete(index)}
                                                type="button"
                                                style={{ marginLeft: "1rem",background:"transparent",border:"none",outline:"none" }}
                                            >
                                               <Cross/>
                                            </button>
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <p></p>
                            )}
                            {/* <button onClick={this.uploadButtonClicked} type="button" className="btn btn-default">
						<Paperclip/> Upload
					</button> */}
                        </div>
                    </div>

                    <SaveButton />
                </form>
            </Modal>
        );
    }
}
