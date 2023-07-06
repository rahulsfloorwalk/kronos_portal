import React from "react";
import PropTypes from "prop-types";
import { Link } from "react-router";
import { Plus, Pencil, Cross } from "../../../../components/Icons.jsx";
import { findInterestAreas,deleteInterestArea } from "../../../service/admin_dashboard.js";
import Alert from "react-s-alert";

class InterestAreaRow extends React.Component {
    static propTypes = {
        seq: PropTypes.number.isRequired,
        interestarea: PropTypes.shape({
            id: PropTypes.number,
            name: PropTypes.string,
        }),
    };
    render() {
        return (
            <tr>
                <td className="text-right">{this.props.seq}</td>
                <td>{this.props.interestarea.name}</td>
                <td>
                <span style={{marginRight:"2rem"}}>
                    <Link
                        to={`/admindashboard/interested_area/${this.props.interestarea.id}/edit`}
                        className="btn btn-default"><Pencil /></Link>
             </span>
                    <button type="button"
                        onClick={() => this.props.onDelete(this.props.interestarea)}
                        className="btn btn-default"><Cross /></button>
                </td>
            </tr>
        );
    }
}

export default class InterestAreaList extends React.Component {
    static propTypes = {
        children: PropTypes.node,
    };
    state = {
        interestareas: [],
    };
    componentDidMount() {
        findInterestAreas().then((interestareas) => {
            this.setState({
                interestareas
            });
        });
    }

    componentWillReceiveProps() {
        this.componentDidMount();
    }

    onDelete = (interestarea) => {
        const updatedInterestAreas = this.state.interestareas.filter(
            (c) => c.id !== interestarea.id
        );
        this.setState({
            interestareas: updatedInterestAreas
        });
        deleteInterestArea(interestarea.id).then(() => {
            this.props.onChange && this.props.onChange();
            Alert.success("INTEREST AREA DELETED");
        }, () => {
            Alert.warning("INTEREST AREA CANNOT BE DELETED");
        });
    };

    render() {
        const rows = this.state.interestareas.map((c, i) => <InterestAreaRow seq={i + 1} interestarea={c} key={c.id}
            onDelete={this.onDelete}
        />);
        return (
                <div className="panel panel-default table-responsive">
                    <h3 style={{ padding: "2rem", borderBottom: "1px solid #eee" }}>
                       Interest Area Table
                        <Link to="/admindashboard/interested_area/add" className="btn btn-default pull-right"><Plus /> Add Interest Area</Link>
                    </h3>
                    <div style={{ padding: "2rem" }}>
                        <table className="table table-striped">
                            <thead>
                                <tr>
                                    <th className="text-right">#</th>
                                    <th>Interest Area</th>
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
