import React from "react";
import PropTypes from "prop-types";
import { Link } from "react-router";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend} from "recharts";
import { Text } from "recharts";

import {demo} from "../../../config.js";

import {fetchStoreWisePerformance} from "../service/dashboard.js";

import { getColor } from "../../utils.js";
import { ThList } from "../../components/Icons.jsx";
import Loading from "../../components/Loading.jsx";
import Jumbotron from "../../components/Jumbotron.jsx";
import Modal from "../../components/Modal.jsx";

class AuditCycleStorePerformance extends React.Component{
	static propTypes = {
		title: PropTypes.string.isRequired,
		type: PropTypes.oneOf(["best", "worst", "all"]).isRequired,
		reportData: PropTypes.shape({
			data: PropTypes.array.isRequired,
			columns: PropTypes.arrayOf(PropTypes.string).isRequired,
		}).isRequired,
	};

	static defaultProps = {
		type: "best",
	};

	state = {
		dataPopup: false,
	};

	toggleModal = () => {
		this.setState( prevState => Object.assign({}, prevState, { dataPopup: !this.state.dataPopup }));
	};

	create_structure = (input_data) => {
		let data_arr = input_data.data;
		let label_arr = input_data.columns;
		let size = this.props.type === "all" ? data_arr.length : 5;

		if(this.props.type === "worst"){
			data_arr = data_arr.slice().reverse();
		}
		let data = [];
		for(let i=0; i < size; i++){
			let obj = {};
			obj["name"] = data_arr[i][0].name;
			obj["type"] = data_arr[i][0].type;
			obj["code"] = data_arr[i][0].code;
			for(let j=0; j < label_arr.length; j++){
				obj[label_arr[j]] = data_arr[i][1][j] ? data_arr[i][1][j].value : null;
			}
			data.push(obj);
		}
		return data;
	};

	tickFunction = (values) => {
		// lol hack
		let count = this.props.reportData && this.props.reportData.data.length > 0 ? this.props.reportData.data.length : 1;
		return (<Text {...values} width={values.width / count}>{values.payload.value}</Text>);
	};

	render(){
		let colors = ["#005d8a", "#0085c6", "#4ca9d7"];
		if (this.props.type === "best" || this.props.type === "all"){
			colors = ["#688833", "#30AD23", "#11772D"];
		}
		else if (this.props.type === "worst"){
			colors = ["#D94E47", "#D0231A", "#A61C14"];
		}
		let bars = [];

		let labels = this.props.reportData.columns;
		for(let i=0; i < labels.length; i++){
			bars.push(<Bar key={i} dataKey={labels[i]} barSize={20} fill={colors[i]} label={v => <Text {...v}>{v.value === null ? "N/A" : v.value+"%"}</Text>}/>);
		}

		let data = this.create_structure(this.props.reportData);

		let chart = (
			<ResponsiveContainer width="100%" aspect={3 / 1}>
				<BarChart width={600} height={300} data={data} margin={{top: 25, right: 10, left: 10, bottom: 5}} onClick={(active)=>active&&this.toggleModal()}>
					<XAxis dataKey="name" tick={this.tickFunction} interval={0}/>
					<YAxis label="Score" domain={[0,100]} tickFormatter={f => f + "%"}/>
					<Tooltip formatter={v => v === null ? "N/A" : v+"%"}/>
					<Legend wrapperStyle={{ top: 0}} verticalAlign="top"/>
					{bars}
				</BarChart>
			</ResponsiveContainer>
		);
		return(
			<div>
				<button className="btn btn-default pull-right" onClick={this.toggleModal} title="View Data"><ThList/></button>
				<h3 className="text-center">{this.props.title}</h3>
				{chart}
				{ this.state.dataPopup ?
					<Modal modalTitle={this.props.title} onClose={this.toggleModal}>
						<table className="table table-striped ">
							<thead>
								<tr>
									<th>Store Code</th>
									<th>Store Name</th>
									{this.props.reportData.columns.map((l) => <th key={l} className="text-right">{l}</th>)}
								</tr>
							</thead>
							<tbody>
								{((reportData) => {
									let trs = [];
									let data = reportData.data;
									if(this.props.type === "worst"){
										data = data.slice().reverse();
									}
									for(let i=0; i < data.length; i++){
										let tds = [];
										tds.push(<td key={data[i][0].code}>{data[i][0].code}</td>);
										tds.push(<td key={data[i][0].name}>{data[i][0].name}</td>);
										for(let j=0; j < reportData.columns.length; j++){
											if(data[i][1][j]){
												tds.push(<td key={i+"."+j} className={"text-right "+getColor(data[i][1][j].color_code)}>{data[i][1][j].value}%</td>);
											} else {
												tds.push(<td className="text-right" key={j+"-"+i}></td>);
											}
										}
										tds.push(<td key={data[i][0].id}><Link to={`/store/${data[i][0].id}/trends`} className="btn btn-default">View</Link></td>);
										trs.push(<tr key={data[i][0].name}>{tds}</tr>);
									}
									return trs;
								})(this.props.reportData)}
							</tbody>
						</table>
					</Modal>
					: null }
			</div>
		);
	}
}

class AuditCycleStorePerformanceWrapper extends React.Component{
	static propTypes = {
		questionnaireType: PropTypes.shape({
			id: PropTypes.number.isRequired,
			name: PropTypes.string.isRequired,
			is_default: PropTypes.bool.isRequired,
			client_id: PropTypes.number.isRequired,
		}).isRequired,
	};

	state = {
		loading: false,
		reportData: null,
	};

	setLoading = (loading) => {
		this.setState( prevState => {
			return Object.assign({}, prevState, {
				loading
			});
		});
	};

	reloadData = (questionnaireTypeId) => {
		if(!demo){
			this.setLoading(true);
			fetchStoreWisePerformance(questionnaireTypeId).then((reportData) => {
				this.setState({
					"reportData": reportData
				});
			}).always(() => this.setLoading(false));
		}
	};

	componentDidMount(){
		//console.log("AuditCycleStorePerformance","componentDidMount");
		this.reloadData(this.props.questionnaireType.id);
	}

	componentWillReceiveProps(nextProps){
		//console.log("AuditCycleStorePerformance","componentWillReceiveProps", nextProps.auditType);
		if( this.props.questionnaireType !== nextProps.questionnaireType) {
			this.reloadData(nextProps.questionnaireType.id);
		}
	}

	render(){
		if(this.state.loading || ! this.state.reportData ){
			return <Loading/>;
		} else if(this.state.reportData.data.length === 0 ){
			return (
				<div>
					<h3 className="text-center">Business Unit Performance</h3>
					<Jumbotron heading="" para="chart will be visible once reports are completed"/>
				</div>
			);
		} else if(this.state.reportData.data.length > 10) {
			return (
				<div className="row">
					<div className="col-md-6">
						<AuditCycleStorePerformance title="Best Performing Business Units" type="best" reportData={this.state.reportData}/>
					</div>
					<div className="col-md-6">
						<AuditCycleStorePerformance title="Worst Performing Business Units" type="worst" reportData={this.state.reportData}/>
					</div>
				</div>
			);
		} else {
			return (
				<AuditCycleStorePerformance title="Business Unit Performance" type="all" reportData={this.state.reportData}/>
			);
		}
	}
}

export default AuditCycleStorePerformanceWrapper;
