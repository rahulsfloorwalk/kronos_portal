import React from "react";
import { Link } from "react-router";
import { fetchCertificateScore } from "../service/profile.js";
import Loading from "../../components/Loading.jsx";
import  PropTypes  from "prop-types";

class CertificateInfoPage extends React.Component {
	static propTypes={
		children:PropTypes.node,
		dispatch: PropTypes.func.isRequired,
		profileInfo:PropTypes.shape({
			certification_score:PropTypes.string,
		}),
	};
	state = {
		loading: false,
		profileInfo:{},
		showTik : false,
	};
	setLoading = (loading) => {
		this.setState(prevState => Object.assign({}, prevState, {loading}));
	};

	componentDidMount() {
		this.setLoading(true);
		fetchCertificateScore().done((profileInfo)=>{
			this.setState({profileInfo});
		}).always(() => this.setLoading(false));
	}
	render() {
		const margin_bottom = {
			marginBottom: "15px",
		};
		const main_div_style = {
			backgroundColor: "#f9f9f9",
			padding: "15px",
		};
		const checkbox = {
			width : "50px",
			height: "15px"
		};
		const startBtn = {
			padding: ".7rem 1.8rem",
			fontSize: "1.5rem",
			backgroundColor: "rgb(51,122,183)",
			color: "white",
			borderRadius: "5px",
			marginTop: "1.5rem",
		};
		return (
			<div>
				{this.state.loading ? <Loading/> :
					( this.state.profileInfo.certification_score ? <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
						<p style={{ fontSize: "2.5rem" }}> <b style={{ fontSize: "2.7rem", color: "rgb(51,122,183)" }}>Congratulations! </b> you have completed the certification and have scored</p>
						<h1 style={{ color: "rgb(51,122,183)" }}>{this.state.profileInfo.certification_score}%</h1>
						<p style={{ fontSize: "2.5rem" }}> You can now move ahead and apply for audits in the opportunities tab.</p>
					</div> :
						<div style={main_div_style}>
							<h2 className="page-header" style={{textAlign: "center"}}>Auditor Certification Test</h2>
							<div className="row" style={margin_bottom}>
								<div style={{padding: "2rem",fontSize: "2rem"}}>
									<p>This certification will help us understand you better. By completing this certificate, you will increase your chances for getting mystery audits. The higher the score, better are the chances of getting mystery audits.</p>
								</div>
							</div>
							<div className="row" style={margin_bottom}>
								<div className="col-sm-6 col-md-6">
									<h4 className="page-header" style={{ paddingBottom: "5px", margin: "5px 0 5px", fontWeight: "bold", borderBottom: "0px",  }}>The Auditor Certification test will be conducted to check:</h4>
									<div style={{fontSize: "1.5rem"}}>
										<p> 1. Comprehension Skill</p>
										<p> 2. Visual Observation Skill</p>
										<p> 3. Listening Skill</p>
										<p> 4. English Grammer Knowledge</p>
										<p> 5. Problem-solving ability</p>
									</div>
								</div>
							</div>
							<div className="row" style={margin_bottom}>
								<div className="col-sm-6 col-md-6">
									<h4 className="page-header" style={{ paddingBottom: "5px", margin: "5px 0 5px", fontWeight: "bold", borderBottom: "0px" }}>Test instructions:</h4>
									<div style={{fontSize: "1.5rem"}}>
										<p> ➡️ Upon completion of this test, you will be registered as a Certified Auditor. </p>
										<p> ➡️ No go-backs are permitted.</p>
										<p> ➡️ Only 1 attempt is allowed.</p>
										<p> ➡️ Test scores out of 100 will be displayed on successful completion of the test.</p>
										<p> ➡️ There is no time limit to complete the test, however, it will approximately take 20 minutes to complete the test.</p>
										<p> ➡️ It is expected that you will solve the test with your full attention.</p>
										<p> ➡️ Do not Refresh the page during the Test</p>
									</div>
								</div>
							</div>
							<div>
								<label>I have read & understood the instructions</label>
								<input type="checkbox" onClick={() => this.setState({ showTik: !this.state.showTik})} style={checkbox}/>
							</div>
							{this.state.showTik && <Link to="certification/questions">	<button style={startBtn}>Start Test</button></Link>}
						</div>
					)}
				{this.props.children}
			</div>
		);
	}
}
export default CertificateInfoPage;
