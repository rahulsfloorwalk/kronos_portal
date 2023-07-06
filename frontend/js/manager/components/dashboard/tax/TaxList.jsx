import React from "react";
import PropTypes from "prop-types";
import { Link } from "react-router";
import { Plus, Pencil, Cross } from "../../../../components/Icons.jsx";
import { findTaxes, deleteTax } from "../../../service/admin_dashboard.js";
import Alert from "react-s-alert";

class TaxRow extends React.Component {
    static propTypes = {
					seq: PropTypes.number.isRequired,
					tax: PropTypes.shape({
						name: PropTypes.string,
						id: PropTypes.number,
						rate: PropTypes.number,
					}),
    };
    render() {
        return (
            <tr>
                <td className="text-right">{this.props.seq}</td>
                <td>{this.props.tax.name}</td>
                <td>{this.props.tax.rate}</td>
                <td>
                    <span style={{ marginRight: "2rem" }}>
                        <Link
                            to={`/admindashboard/tax/${this.props.tax.id}/edit`}
                            className="btn btn-default"><Pencil /></Link>
                    </span>
                    <button type="button"
                        onClick={() => this.props.onDelete(this.props.tax)}
                        className="btn btn-default"><Cross /></button>
                </td>
            </tr>
        );
    }
}

export default class TaxList extends React.Component {
    static propTypes = {
        children: PropTypes.node,
    };
    state = {
        taxes: [],
    };
    componentDidMount() {
        findTaxes().then((taxes) => {
            this.setState({
                taxes
            });
        });
    }

    componentWillReceiveProps() {
        this.componentDidMount();
    }

    onDelete = (tax) => {
        const updatedTaxes = this.state.taxes.filter(
            (c) => c.id !== tax.id
        );
        this.setState({
            taxes: updatedTaxes,
        });
        deleteTax(tax.id).then(() => {
            this.props.onChange && this.props.onChange();
            Alert.success("Tax DELETED");
        }, (error) => {
            console.log(error)
            Alert.warning("Tax CANNOT BE DELETED");
        });
    };

    render() {
        const rows = this.state.taxes.map((c, i) => <TaxRow seq={i + 1} tax={c} key={c.id}
            onDelete={this.onDelete}
        />);
        return (
                <div className="panel panel-default table-responsive">
                    <h3 style={{ padding: "2rem", borderBottom: "1px solid #eee" }}>
                        Tax Table
                        <Link to="/admindashboard/tax/add" className="btn btn-default pull-right"><Plus /> Add Tax</Link>
                    </h3>
                    <div style={{ padding: "2rem" }}>
                        <table className="table table-striped">
                            <thead>
                                <tr>
                                    <th className="text-right">#</th>
                                    <th>Tax Name</th>
                                    <th>Tax Rate (Percentage)</th>
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
