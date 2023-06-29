import React from "react";
import PropTypes from "prop-types";


export default class ArchivedSolution extends React.Component {
render() {

    return (
        <div className="container-fluid">
        <div className="panel panel-default">
            <h3 style={{ padding: "2rem", borderBottom: "1px solid #eee"}}>
             Solution Table
             <div className="btn btn-default pull-right">Unarchived</div>
            </h3>
           
            <div style={{ padding: "2rem" }}>
                <table className="table table-striped">
                    <thead>
                        <tr>
                            <th>Name</th>
                            <th>Category</th>
                            <th>SubCategory</th>
                            <th>Price</th>
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
