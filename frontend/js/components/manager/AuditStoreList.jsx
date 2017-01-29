import React from 'react';
import * as ReactRedux from 'react-redux';
import { Link } from 'react-router';

import Panel from '../Panel.jsx';

import {fetchAuditStores} from '../../manager/actions/audit_store.js';

var AuditStoreRow = React.createClass({
  render: function(){
    var LinkTo = `/auditStore/${this.props.auditStore.id}`;
    return(
      <tr>
        <td>{this.props.auditStore.store}</td>
        <td>{this.props.auditStore.count}</td>
        <td>
          <Link to={LinkTo} className="btn btn-primary pull-right">View</Link>
        </td>
      </tr>
    );
  },
});
var AuditStoreList = React.createClass({
  componentDidMount: function(){
    this.props.dispatch(fetchAuditStores(this.props.auditCycleId));
  },
  render: function(){
    var rows = [];
    for(var id in this.props.auditStores){
      rows.push(<AuditStoreRow auditStore={this.props.auditStores[id]} key={id} />);
    }
    var addAuditStoreLink = `/audit_cycle/${this.props.auditCycleId}/audit_store/add`;
    return(
      <div>
        <h2 className="page-header">
          <Link to={addAuditStoreLink} className="btn btn-default pull-right">Add Audit Store</Link>
          Audit Store List
        </h2>
        <table classname="table table-striped">
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

var mapAuditStoreToProps = function(store, ownProps){
  return{
    auditStores: store.auditStores,
    auditCycleId:ownProps.auditCycleId
  };
}
export default ReactRedux.connect(mapAuditStoreToProps)(AuditStoreList);
