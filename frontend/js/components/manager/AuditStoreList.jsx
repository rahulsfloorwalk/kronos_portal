import React from 'react';
import * as ReactRedux from 'react-redux';
import { Link } from 'react-router';

import { File } from '../Icons.jsx';
import Panel from '../Panel.jsx';
import AuditStoreStatusLabel from '../AuditStoreStatusLabel.jsx';

import {fetchAuditStores} from '../../manager/actions/audit_store.js';
import { getAuditStoreStatus } from '../../utils.js';

var AuditStoreRow = React.createClass({
  render: function(){
    return(
      <tr>
        <td>{this.props.auditStore.user.profileinfo.first_name} {this.props.auditStore.user.profileinfo.last_name}</td>
        <td>{this.props.auditStore.audit_date}</td>
        <td><AuditStoreStatusLabel status={this.props.auditStore.status}/></td>
        <td>
          <Link to={`/audit_store/${this.props.auditStore.id}/report`} className="btn btn-default">View</Link>
        </td>
      </tr>
    );
  },
});
var AuditStoreList = React.createClass({
  componentDidMount: function(){
    this.props.dispatch(fetchAuditStores(this.props.params.auditCycleId));
  },
  render: function(){
    var rows = [];
    for(var id in this.props.auditStores){
      rows.push(<AuditStoreRow auditStore={this.props.auditStores[id]} key={id} />);
    }
    return(
      <div>
        <h3 className="page-header">
          <File/> Reports
        </h3>
        <table className="table table-striped">
          <thead>
            <tr>
              <th>Auditor Name</th>
              <th>Audit Date</th>
              <th>Report Status</th>
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

var mapStoreToProps = function(store, ownProps){
  return{
    auditStores: store.auditStores
  };
}
export default ReactRedux.connect(mapStoreToProps)(AuditStoreList);
