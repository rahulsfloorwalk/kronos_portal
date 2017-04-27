import React from 'react';

import LatestAuditStore from './LatestAuditStore.jsx';
import AuditCycleCityMatrix from './AuditCycleCityMatrix.jsx';
import AuditCycleTimeSeries from './AuditCycleTimeSeries.jsx';

import { Dashboard } from '../../js/components/Icons.jsx';

export default React.createClass({
	render: function(){
		return (
			<div>
				<h2 className="page-header"><Dashboard/> Dashboard</h2>
				<div className="row">
					<div className="col-md-12">
						<AuditCycleTimeSeries />
					</div>
				</div>
				<div className="row">
					<div className="col-md-12">
						<AuditCycleCityMatrix auditCycleId={this.props.params.auditCycleId}/>
					</div>
				</div>
			</div>
		);
	},
});
