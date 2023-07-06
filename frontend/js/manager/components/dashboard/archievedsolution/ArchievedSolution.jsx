import React from "react";
import PropTypes from "prop-types";
import { findArchievedSolutions,updateSolutionIsActive } from "../../../service/admin_dashboard";
import Alert from "react-s-alert";

const FieldErrors = PropTypes.arrayOf(PropTypes.string);
class ArchievedSolutionRow extends React.Component {
    static propTypes = {
        seq: PropTypes.number.isRequired,
        solution: PropTypes.shape({
            id: PropTypes.number,
            name: PropTypes.string,
            url_structure: PropTypes.string,
            price: PropTypes.number,
            about: PropTypes.string,
            overview: PropTypes.string,
            how_it_work: PropTypes.string,
            execution_time: PropTypes.string,
            short_description: PropTypes.string,
            is_active: PropTypes.bool,
            category: PropTypes.object,
            sub_category: PropTypes.object,
            tax: PropTypes.object,
        }),
        errors: PropTypes.shape({
            non_field_errors: PropTypes.arrayOf(PropTypes.string),
            category: FieldErrors,
            sub_category: FieldErrors,
            tax: FieldErrors,
        }),

    };

    render() {

        const { solution } = this.props;
        return (
            <tr>
                <td className="text-right">{this.props.seq}</td>
                <td>{this.props.solution.name}</td>
                <td>{this.props.solution.category && this.props.solution.category.name}</td>
                <td>{this.props.solution.sub_category && this.props.solution.sub_category.name}</td>
                <td>{this.props.solution.price}</td>
                <td>
                <button
                            onClick={() => this.props.toggleIsActive(this.props.solution)}
                            className="btn btn-default"
                        >
                            UnArchive
                        </button>
                </td>
            </tr>
        );
    }
}

export default class ArchivedSolution extends React.Component {
    static propTypes = {
        children: PropTypes.node,
    };
    state = {
        solutions: [],
    };
    componentDidMount() {
        findArchievedSolutions().then((solutions) => {
            this.setState({
                solutions
            });
        });
    }

    componentWillReceiveProps() {
        this.componentDidMount();
    }
    toggleIsActive = (solution) => {
        const updatedSolution = { ...solution, is_active: true }; // Set is_active to true
        const updatedSolutions = this.state.solutions.map((c) =>
            c.id === solution.id ? updatedSolution : c
        );

        this.setState({
            solutions: updatedSolutions,
        });

        updateSolutionIsActive(solution.id, updatedSolution)
            .then(() => {
                Alert.success("Solution is now UnArchived");
            })
            .catch(() => {
                Alert.error("Failed to UnArchive Solution");
            });
    };
render() {
    const activeSolutions = this.state.solutions.filter(
        (solution) => solution.is_active===false
    );
    const rows = activeSolutions.map((c, i) => <ArchievedSolutionRow seq={i + 1}   solution={c} key={c.id}
    toggleIsActive={this.toggleIsActive}
    />);

    return (
        <div className="panel panel-default table-responsive">
            <h3 style={{ padding: "2rem", borderBottom: "1px solid #eee"}}>
            Archived Solution Table
            </h3>
           
            <div style={{ padding: "2rem" }}>
            <table className="table table-striped">
                    <thead>
                        <tr>
                            <th className="text-right">#</th>
                            <th>Name</th>
                            <th>Category</th>
                            <th>SubCategory</th>
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
    );
}
}
