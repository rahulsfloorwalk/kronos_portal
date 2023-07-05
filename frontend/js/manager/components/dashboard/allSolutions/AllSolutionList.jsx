import React from "react";
import PropTypes from "prop-types";
import { Link } from "react-router";
import { Plus, Pencil, Cross } from "../../../../components/Icons.jsx";
import { findSolutions,deleteSolution,findSubCategoryById, findById} from "../../../service/admin_dashboard.js";
import Alert from "react-s-alert";

const FieldErrors = PropTypes.arrayOf(PropTypes.string);
class AllSolutionRow extends React.Component {
    static propTypes = {
        seq: PropTypes.number.isRequired,
        solution: PropTypes.shape({
            id: PropTypes.number,
            name: PropTypes.string,
            url_structure : PropTypes.string,
            price : PropTypes.number,
            about :PropTypes.string,
            overview :PropTypes.string,
            how_it_work :PropTypes.string,
            execution_time : PropTypes.string,
            short_description :PropTypes.string,
            is_active : PropTypes.bool,
            category : PropTypes.object,
            sub_category : PropTypes.object,
            tax : PropTypes.object,
        }),
        errors: PropTypes.shape({
            non_field_errors: PropTypes.arrayOf(PropTypes.string),
			category: FieldErrors,
			sub_category: FieldErrors,
			tax: FieldErrors,
		}).isRequired,

    };
    render() {
        return (
            <tr>
                <td className="text-right">{this.props.seq}</td>
                <td>{this.props.solution.name}</td>
                <td>{this.props.solution.category && this.props.solution.category.name}</td>
                <td>{this.props.solution.sub_category && this.props.solution.sub_category.name}</td>
                <td>{this.props.solution.price}</td>
                <td>
                <span style={{marginRight:"2rem"}}>
                    <Link
                        to={`/admindashboard/solution/${this.props.solution.id}/edit`}
                        className="btn btn-default"><Pencil /></Link>
                </span>
                    <button type="button"
                        onClick={() => this.props.onDelete(this.props.solution)}
                        className="btn btn-default"><Cross />
                    </button>
                </td>
            </tr>
        );
    }
}

export default class AllSolutionList extends React.Component {
    static propTypes = {
        children: PropTypes.node,
    };
    state = {
        solutions: [],
    };
    componentDidMount() {
        findSolutions().then((solutions) => {
            this.setState({
                solutions
            });
        });
    }

    componentWillReceiveProps() {
        this.componentDidMount();
    }

    onDelete = (solution) => {
        const updatedSolutions = this.state.solutions.filter(
            (c) => c.id !== solution.id
        );
        this.setState({
            solutions: updatedSolutions
        });
        deleteSolution(solution.id).then(() => {
            this.props.onChange && this.props.onChange();
            Alert.success("SOLUTION DELETED");
        }, () => {
            Alert.warning("SOLUTION CANNOT BE DELETED");
        });
    };

    render() {
        const rows = this.state.solutions.map((c, i) => <AllSolutionRow seq={i + 1} solution={c} key={c.id}
            onDelete={this.onDelete}
        />);
        return (
            <div className="container-fluid">
                <div className="panel panel-default">
                    <h3 style={{ padding: "2rem", borderBottom: "1px solid #eee" }}>
                       Solution Table
                        <Link to="/admindashboard/solution/add" className="btn btn-default pull-right"><Plus /> Add Solution</Link>
                    </h3>
                   
                    <div style={{ padding: "2rem" }}>
                        <table className="table table-striped">
                            <thead>
                                <tr>
                                    <th className="text-right">#</th>
                                    <th>Solution Name</th>
                                    <th>Category</th>
                                    <th>Sub Category</th>
                                    <th>Price</th>
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
            </div>
        );
    }
}
