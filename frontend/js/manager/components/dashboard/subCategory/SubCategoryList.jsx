import React from "react";
import PropTypes from "prop-types";
import { Link } from "react-router";
import { Plus, Pencil, Cross } from "../../../../components/Icons.jsx";
import { findSubCategories, deleteSubCategory } from "../../../service/admin_dashboard.js";
import Alert from "react-s-alert";

class SubCategoryRow extends React.Component {
    static propTypes = {
        seq: PropTypes.number.isRequired,
        sub_category_name: PropTypes.shape({
            id: PropTypes.number,
            name: PropTypes.string,
        }),
    };
    render() {
        return (
            <tr>
                <td className="text-right">{this.props.seq}</td>
                <td>{this.props.sub_category_name.name}</td>
                <td>
                <span style={{marginRight:"2rem"}}>
                    <Link
                        to={`/admindashboard/subcategory/${this.props.sub_category_name.id}/edit`}
                        className="btn btn-default"><Pencil /></Link>
             </span>
                    <button type="button"
                        onClick={() => this.props.onDelete(this.props.sub_category_name)}
                        className="btn btn-default"><Cross /></button>
                </td>
            </tr>
        );
    }
}

export default class SubCategoryList extends React.Component {
    static propTypes = {
        children: PropTypes.node,
    };
    state = {
        sub_category_names: [],
    };
    componentDidMount() {
        findSubCategories().then((sub_category_names) => {
            this.setState({
                sub_category_names
            });
        });
    }

    componentWillReceiveProps() {
        this.componentDidMount();
    }

    onDelete = (subcategory) => {
        const updatedCategories = this.state.sub_category_names.filter(
            (c) => c.id !== subcategory.id
        );
        this.setState({
            sub_category_names: updatedCategories
        });
        deleteSubCategory(subcategory.id).then(() => {
            this.props.onChange && this.props.onChange();
            Alert.success("SUBCATEGORY DELETED");
        }, () => {
            Alert.warning("SUBCATEGORY CANNOT BE DELETED");
        });
    };

    render() {
        const rows = this.state.sub_category_names.map((c, i) => <SubCategoryRow seq={i + 1} sub_category_name={c} key={c.id}
            onDelete={this.onDelete}
        />);
        return (
                <div className="panel panel-default table-responsive">
                    <h3 style={{ padding: "2rem", borderBottom: "1px solid #eee" }}>
                        Sub Category Table
                        <Link to="/admindashboard/subcategory/add" className="btn btn-default pull-right"><Plus /> Add Sub-Category</Link>
                    </h3>
                    <div style={{ padding: "2rem" }}>
                        <table className="table table-striped">
                            <thead>
                                <tr>
                                    <th className="text-right">#</th>
                                    <th>SubCategory</th>
                                    <th>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {rows}
                            </tbody>
                        </table>
                        {this.props.children}
                    </div>
                </div>
        );
    }
}
