import React from "react";
import PropTypes from "prop-types";
import { EyeOpen,User } from "../../../components/Icons.jsx";

export default class ActiveCustomer extends React.Component {
render() {

    return (
        <div className="container-fluid">
        <div className="panel panel-default">
            <h3 style={{ padding: "2rem", borderBottom: "1px solid #eee"}}>
              Active Customer
            </h3>
           
            <div style={{ padding: "2rem" }}>
                <table className="table table-striped">
                    <thead>
                        <tr>
                            <th>Full Name</th>
                            <th>Email</th>
                            <th>Mobile</th>
                            <th>Customer Status</th>
                            <th>&nbsp;</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td><User/> <span style={{marginLeft:"1rem"}}>Bahni</span></td>
                            <td>bahni@gmail.com</td>
                            <td>8765434567</td>
                            <td>verified</td>
                            <td><EyeOpen/></td>
                        </tr>
                       {/* {rows} */}
                    </tbody>
                </table>
                {this.props.children}
            </div>
        </div>
    </div>
    );
}
}
