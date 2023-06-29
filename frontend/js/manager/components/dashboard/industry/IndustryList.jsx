import React from "react";
import PropTypes from "prop-types";
import { Link } from "react-router";
import { Plus, Pencil, Cross } from "../../../../components/Icons.jsx";
import { findIndustries,deleteIndustry } from "../../../service/admin_dashboard.js";
import Alert from "react-s-alert";

class IndustryRow extends React.Component {
    static propTypes = {
        seq: PropTypes.number.isRequired,
        industry: PropTypes.shape({
            id: PropTypes.number,
            name: PropTypes.string,
        }),
    };
    render() {
        return (
            <tr>
                <td className="text-right">{this.props.seq}</td>
                <td>{this.props.industry.name}</td>
                <td>
                <span style={{marginRight:"2rem"}}>
                    <Link
                        to={`/admindashboard/industry/${this.props.industry.id}/edit`}
                        className="btn btn-default"><Pencil /></Link>
             </span>
                    <button type="button"
                        onClick={() => this.props.onDelete(this.props.industry)}
                        className="btn btn-default"><Cross /></button>
                </td>
            </tr>
        );
    }
}

export default class IndustryList extends React.Component {
    static propTypes = {
        children: PropTypes.node,
    };
    state = {
        industries: [],
    };
    componentDidMount() {
        findIndustries().then((industries) => {
            this.setState({
                industries
            });
        });
    }

    componentWillReceiveProps() {
        this.componentDidMount();
    }

    onDelete = (industry) => {
        const updatedIndustries = this.state.industries.filter(
            (c) => c.id !== industry.id
        );
        this.setState({
            industries: updatedIndustries
        });
        deleteIndustry(industry.id).then(() => {
            this.props.onChange && this.props.onChange();
            Alert.success("INDUSTRY DELETED");
        }, () => {
            Alert.warning("INDUSTRY CANNOT BE DELETED");
        });
    };

    render() {
        const rows = this.state.industries.map((c, i) => <IndustryRow seq={i + 1} industry={c} key={c.id}
            onDelete={this.onDelete}
        />);
        return (
            <div className="container-fluid">
                <div className="panel panel-default">
                    <h3 style={{ padding: "2rem", borderBottom: "1px solid #eee" }}>
                       Industry Table
                        <Link to="/admindashboard/industry/add" className="btn btn-default pull-right"><Plus /> Add Industry</Link>
                    </h3>
                    <div style={{ padding: "2rem" }}>
                        <table className="table table-striped">
                            <thead>
                                <tr>
                                    <th className="text-right">#</th>
                                    <th>Industry Name</th>
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
