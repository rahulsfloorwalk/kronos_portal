import React from "react";
import PropTypes from "prop-types";


export default class AllOrder extends React.Component {
render() {

    return (
        <div className="container-fluid">
        <div className="panel panel-default">
            <h3 style={{ padding: "2rem", borderBottom: "1px solid #eee"}}>
             All Order Table
            </h3>
           
            <div style={{ padding: "2rem" }}>
                <table className="table table-striped">
                    <thead>
                        <tr>
                            <th>Order Id</th>
                            <th>Order Date</th>
                            <th>Name</th>
                            <th>Solutions Name</th>
                            <th>Category</th>
                            <th>Total Responses</th>
                            <th>Order Status</th>
                        </tr>
                    </thead>
                    <tbody>
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
