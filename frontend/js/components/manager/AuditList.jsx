import React from 'react';
import * as ReactRedux from 'react-redux';
import { Link } from 'react-router';

import Panel from '../Panel.jsx';

import {fetchAudits} from '../../manager/actions/audit.js';

var AuditRow = React.createClass({
  render: function(){
    var LinkTo = `/audit/${this.props.audit.id}`;
    return(
      <tr>
        <td>{this.props.audit.store.name}</td>
        <td>{this.props.audit.count}</td>
        <td>
          <Link to={LinkTo} className="btn btn-primary pull-right">View</Link>
        </td>
      </tr>
    );
  },
});
var AuditList = React.createClass({
  componentDidMount: function(){
    this.props.dispatch(fetchAudits(this.props.params.auditCycleId));
  },
  render: function(){
    var rows = [];
    for(var id in this.props.audits){
      rows.push(<AuditRow audit={this.props.audits[id]} key={id} />);
    }
    var addAuditLink = `/audit_cycle/${this.props.params.auditCycleId}/audit/add`;
    return(
      <div>
        <h2 className="page-header">
          <Link to={addAuditLink} className="btn btn-default pull-right">Add Audit</Link>
          Audit List
        </h2>
        <table className="table table-striped">
          <thead>
            <tr>
              <th>Store</th>
              <th>Count</th>
            </tr>
          </thead>
          <tbody>
            {rows}
          </tbody>
        </table>
        {this.props.children}
      </div>
    );
  },
});

var mapAuditToProps = function(store, ownProps){
  return{
    audits: store.audits,
  };
}
export default ReactRedux.connect(mapAuditToProps)(AuditList);
