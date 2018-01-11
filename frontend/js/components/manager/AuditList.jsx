import React, { Component } from 'react';
import * as ReactRedux from 'react-redux';
import { hashHistory, Link } from 'react-router';

import Alert from 'react-s-alert';

import { CSSTransitionGroup } from 'react-transition-group';

import moment from 'moment';
import { momentDateFormat }  from '../../../config.js';

import { pointerStyle }  from '../../styles.js';

import { Duplicate, Cross, HandRight, Pencil, Plus, Inbox, ThumbsUp, ThumbsDown, User, Earphone, Calendar, ChevronDown, ChevronRight, File } from '../Icons.jsx';
import Badge from '../Badge.jsx';
import Panel from '../Panel.jsx';
import Loading from '../Loading.jsx';

import ApplicationStatusLabel from '../ApplicationStatusLabel.jsx';
import MarkdownViewer from '../MarkdownViewer.jsx';

import ApplicationStatusSummary from './ApplicationStatusSummary.jsx';

import { AuditStoreTable } from './AuditStoreList.jsx';

import {fetchAudits, deleteAudit} from '../../manager/actions/audit.js';

import { rejectAllForAudit, rejectAllForAuditCycle } from '../../manager/service/application.js';
import { findAuditStoresByAudit } from '../../manager/service/audit_store.js';

import AuditApplicationList from './AuditApplicationList.jsx';

class AuditStoreTableForAudit extends Component{
	constructor(props){
		super(props);
		this.state = {
			auditStores: [],
			loading: false,
		};
	}

	setLoading = (loading) => {
		this.setState(prevState => Object.assign({}, prevState, { loading }));
	}

	componentDidMount(){
		this.setLoading(true);
		findAuditStoresByAudit(this.props.auditId).then((auditStores) => {
			this.setState({auditStores});
		}).always(()=>this.setLoading(false));
	}
	render(){
		if(this.state.loading) {
			return <Loading/>;
		} else {
			return (<AuditStoreTable auditStores={this.state.auditStores}/>);
		}
	}
}

var AuditRow = React.createClass({
  getInitialState: function(){
	  return {
		  expanded: false,
		  dropdown: false,
		  selectedTab: "applications",
	  };
  },
	viewButtonClicked: function(e){
		e.preventDefault();
		this.setState({
			expanded: !this.state.expanded
		});
	},
  rejectAllForAuditClicked: function(e){
	  if(confirm("Are you sure you want to deny all applications for this audit?")){
		  rejectAllForAudit(this.props.audit.id).done((count)=>{
			  Alert.success(`${count} APPLICATIONS DENIED`);
			  hashHistory.push(`/audit_cycle/${this.props.params.auditCycleId}/audit`);
		  });
	  }
  },
  render: function(){
	  let reportCount = this.props.audit.report_count;
	  let validReportCount = this.props.audit.valid_report_count;

	  let expandedBorder = {
		  borderLeft: "solid Black 1px",
		  //borderRight: "solid Black 1px",
	  };

	  let backgroundColor;
	  if( validReportCount === 0){
		  backgroundColor = "";
	  }
	  else if( validReportCount >= this.props.audit.count){
		  backgroundColor = "#DFF0D8";
	  } else if(validReportCount < this.props.audit.count){
		  backgroundColor = "#FCF8E3";
	  }

	  let trStyle = Object.assign({}, pointerStyle, {
		  backgroundColor
	  }, this.state.expanded ? expandedBorder : {},
	  this.state.expanded ? { fontSize : "130%", fontWeight: "bold", } : {},
	  this.props.audit.count === 0 ? { opacity : "0.3" } : {},
	  );

	  let currentTab;

	  switch(this.state.selectedTab){
		  case "applications":
			  currentTab = <AuditApplicationList auditId={this.props.audit.id}/>;
			  break;
		  case "reports":
			  currentTab = <AuditStoreTableForAudit auditId={this.props.audit.id}/>;
			  break;
	  }

    return(
      <tbody>
      <tr style={trStyle} onClick={this.viewButtonClicked} title={this.state.expanded ? "Click to Collapse" : "Click to Expand"} className={this.state.expanded ? "active" : ""}>
        <td className="text-right">{this.props.serial}</td>
        <td>
	    {this.props.audit.store.name} {this.props.audit.store.code && " - "+this.props.audit.store.code}<br/>
	    <small className="text-muted">{this.props.audit.store.address}</small>
	</td>
        <td>{this.props.audit.store.city.name}</td>
        <td className="text-right">{this.props.audit.earnings_per_audit}</td>
        <td className="text-right">{this.props.audit.reimbursement ? this.props.audit.reimbursement : null}</td>
        <td className="text-right">{this.props.audit.count}</td>
        <td className="text-right">{this.props.audit.application_count}</td>
        <td className="text-right">{validReportCount} ( {reportCount})</td>
        <td className="text-right">
	    <div className="btn-group">
		    <button type="button" className="btn btn-default" onClick={(e)=>{e.stopPropagation();this.setState({dropdown:!this.state.dropdown});}}>
			    Options <span className="caret"></span>
		    </button>
		    { this.state.dropdown ?
			    <ul className="dropdown-menu" style={{display:"block"}}
			    onMouseEnter={()=>clearTimeout(this.state.dropdownId)}
			    onMouseLeave={()=>this.setState({"dropdownId":setTimeout(()=>this.setState({dropdown:!this.state.dropdown}),500)})}>
				    <li>
					  <Link to={`/audit_cycle/${this.props.auditCycleId}/audit/${this.props.audit.id}/application/fiat`} title="Fiat Assign">
					    <HandRight/> Fiat Assign
					    </Link>
				    </li>
				    <li>
					    <a style={pointerStyle} onClick={this.rejectAllForAuditClicked}>
						    <ThumbsDown/> Deny All Applications
					    </a>
				    </li>
				    <li role="separator" className="divider"></li>
				    <li>
					  <Link to={`/audit_cycle/${this.props.auditCycleId}/audit/${this.props.audit.id}/edit`} title="Edit Audit">
					    <Pencil/> Edit
					    </Link>
				    </li>
				    <li>
					  <a onClick={this.props.onDelete ? (e) => { e.stopPropagation(); this.props.onDelete(this.props.audit)} : ()=>{} } title="Delete Audit">
					    <Cross/> Delete
					  </a>
				    </li>
			    </ul>
		    : null}
	    {/*<button type="button" className="btn btn-default" onClick={this.viewButtonClicked} title="Expand Applications">
			    View
		    </button>
			    {/*this.state.expanded ? <ChevronDown/> : <ChevronRight/>*/}
	    </div>
        </td>
      </tr>
	{ this.props.audit.post_approval_description ?
	<CSSTransitionGroup
		component="tr"
		transitionName="fade"
		style={expandedBorder}
		transitionEnterTimeout={300}
		transitionLeaveTimeout={300}>
		{ this.state.expanded ?
			<td colSpan="9" style={{backgroundColor: "White"}}>
				<MarkdownViewer markdown={this.props.audit.post_approval_description}/>
			</td>
		: null }
	</CSSTransitionGroup>
	: null }
	<CSSTransitionGroup
		component="tr"
		transitionName="fade"
		style={expandedBorder}
		transitionEnterTimeout={300}
		transitionLeaveTimeout={300}>
		{ this.state.expanded ?
			<td colSpan="9" style={{backgroundColor: "White"}}>
				<ul className="nav nav-tabs">
					<li className={this.state.selectedTab === "applications" ? "active" : ""} style={pointerStyle} role="presentation">
						<a onClick={() => this.setState({selectedTab:"applications"})}><Inbox/> Applications</a>
					</li>
					<li className={this.state.selectedTab === "reports" ? "active" : ""} style={pointerStyle} role="presentation">
						<a onClick={() => this.setState({selectedTab:"reports"})}><File/> Reports</a>
					</li>
				</ul>
				<CSSTransitionGroup
					transitionName="fade"
					transitionEnterTimeout={300}
					transitionLeaveTimeout={300}>
						{currentTab}
				</CSSTransitionGroup>
			</td>
		: null }
	</CSSTransitionGroup>
      </tbody>
    );
  },
});

var AuditList = React.createClass({
	getInitialState: function(){
		return {
			loading: false,
			selectedCityId: null,
		};
	},
	setLoading: function(loading){
		this.setState(prevState => Object.assign({}, prevState, {loading}));
	},
  componentDidMount: function(){
	  this.setLoading(true);
    this.props.dispatch(fetchAudits(this.props.params.auditCycleId)).always(()=>this.setLoading(false));
  },
  onDelete: function(audit){
	  this.props.dispatch(deleteAudit(audit.id)).then(()=>{
		  Alert.success("AUDIT DELETED");
	  }, ()=> {
		  Alert.warning("AUDIT CANNOT BE DELETED");
	  });
  },
  onCityChanged: function(e){
	  this.setState({selectedCityId: e.target.value});
  },
  cityComparator: function(a,b){
	if(a.name < b.name) return -1;
	if(a.name > b.name) return 1;
	return 0;
  },
  rejectAllForAuditCycleClicked: function(e){
	  if(confirm("Are you sure you want to deny all applications for this audit cycle?")){
		  rejectAllForAuditCycle(this.props.params.auditCycleId).done((count)=>{
			  Alert.success(`${count} APPLICATIONS DENIED`);
			  hashHistory.push(`/audit_cycle/${this.props.params.auditCycleId}/audit`);
		  });
	  }
  },
  render: function(){
	  if(this.state.loading){
		  return <Loading/>;
	  }

	let cities = Object.keys(this.props.audits).reduce( (p, id) => {
		if(! p.find( c => c.id === this.props.audits[id].store.city.id)){
			return p.concat(this.props.audits[id].store.city);
		} else {
			return p;
		}
	}, []).sort(this.cityComparator);

    let serial = 1;
    let rows = Object.values(this.props.audits)
		  .sort((a,b) => this.cityComparator(a.store.city, b.store.city))
		  .filter((a) => this.state.selectedCityId ? a.store.city.id === parseInt(this.state.selectedCityId) : true)
		  .map( a => <AuditRow key={a.id}
				  serial={serial++}
				  auditCycleId={this.props.params.auditCycleId}
				  audit={a}
				  onDelete={this.onDelete}
				  />
		  );
    var addAuditLink = `/audit_cycle/${this.props.params.auditCycleId}/audit/add`;
    return(
      <div>
        <h3 className="page-header">
	  <span className="pull-right">
	    <div className="btn-group">
		    <Link to={addAuditLink} className="btn btn-default"> <Plus/> Add Audit </Link>
		    <button type="button" className="btn btn-default" onClick={(e)=>{e.stopPropagation();this.setState({dropdown:!this.state.dropdown});}}>
			    <span className="caret"></span>
		    </button>
		    { this.state.dropdown ?
			    <ul className="dropdown-menu" style={{display:"block"}}
			    onMouseEnter={()=>clearTimeout(this.state.dropdownId)}
			    onMouseLeave={()=>this.setState({"dropdownId":setTimeout(()=>this.setState({dropdown:!this.state.dropdown}),500)})}>
				    <li>
					    <Link to={`/audit_cycle/${this.props.params.auditCycleId}/audit/copy`} title="Copy Audits">
					      <Duplicate/> Copy Audits
					    </Link>
				    </li>
				    <li>
					    <a style={pointerStyle} onClick={this.rejectAllForAuditCycleClicked}>
						    <ThumbsDown/> Deny All Applications
					    </a>
				    </li>
			    </ul>
		    : null}
	    </div>
	    &nbsp;
          </span>
          <Inbox/> Audits
        </h3>
	<ApplicationStatusSummary auditCycleId={this.props.params.auditCycleId}/>
        <table className="table table-hover">
          <thead>
            <tr>
              <th className="text-right">#</th>
              <th>Store</th>
              <th>
		<select value={this.state.selectedCity} onChange={this.onCityChanged} className="form-control">
			<option value="">City</option>
		    {cities.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
	        </select>
	      </th>
              <th className="text-right">Fees (₹)</th>
              <th className="text-right">Reimbursement upto (₹)</th>
              <th className="text-right">Audit Count</th>
              <th className="text-right">Applications</th>
              <th className="text-right">Reports</th>
              <th>&nbsp;</th>
            </tr>
          </thead>
            {rows}
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
