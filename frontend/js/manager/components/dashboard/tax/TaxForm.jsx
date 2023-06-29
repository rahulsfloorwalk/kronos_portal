import React from "react";
import PropTypes from "prop-types";
import { hashHistory } from "react-router";
import { findTaxById, updateTax, addTax } from "../../../service/admin_dashboard.js";
import { getInputEventChangeValue } from "../../../../react_utils.js";
import FormInput from "../../../../components/FormInput.jsx";
import SaveButton from "../../../../components/SaveButton.jsx";
import Modal from "../../../../components/Modal.jsx";
import Loading from "../../../../components/Loading.jsx";
import FormErrorList from "../../../../components/FormErrorList.jsx";

export default class SubCategoryForm extends React.Component {
    static propTypes = {
        params: PropTypes.shape({
            taxId: PropTypes.string,
        }),
    };

    state = {
        loading: false,
        tax: {
            name: "",
            rate:0,
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
        if (this.props.params.taxId) {
            this.setLoading(true);
            findTaxById(this.props.params.taxId).then((tax) => {
                this.setState({
                    tax: Object.assign({}, tax)
                });
            }).always(() => this.setLoading(false));
        }
    }

    fieldChanged = (e) => {
        this.setState({
            tax: Object.assign({}, this.state.tax, getInputEventChangeValue(e))
        });
    };

    onSubmit = (e) => {
        e.preventDefault();
        var promise;
        if (this.props.params.taxId) {
            promise = updateTax(
                this.props.params.taxId,
                this.state.tax.name,
                this.state.tax.rate,
            );
        } else {
            promise = addTax(
                this.state.tax.name,
                this.state.tax.rate,
            );
        }
        promise.then(function () {
            hashHistory.push("/admindashboard/tax");
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
        var modalTitle = this.props.params.taxId ? "Edit Tax" : "Add Tax";
        return (
            <Modal modalTitle={modalTitle} onClose={hashHistory.goBack}>
                <form onSubmit={this.onSubmit}>
                    <FormErrorList errors={this.state.errors.non_field_errors} />
                    <FormInput label="Tax Name" type="text" value={this.state.tax.name} name="name" onChange={this.fieldChanged} errors={this.state.errors.name} placeholder="Tax Name" />
                    <FormInput label="Tax Rate" type="number" value={this.state.tax.rate} name="rate" onChange={this.fieldChanged} errors={this.state.errors.rate} placeholder="Tax Rate" />
                    <SaveButton />
                </form>
            </Modal>
        );
    }
}
