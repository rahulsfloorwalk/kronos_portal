import React from "react";
import PropTypes from "prop-types";
import * as ReactRedux from "react-redux";

import { fetchCertificateScore } from "../service/profile.js";
import { setCertificationMarks } from "../actions/profile_info.js";
import Loading from "../../components/Loading.jsx";
import { allTypeofQuiz } from "../../constants.js";

class CertificateQuiz extends React.Component {
	static propTypes={
		dispatch:PropTypes.func.isRequired,
	};
	state = {
		currentQuestion: 0,
		score: 0,
		selectedOption: null,
		submitting:false,
		showScore: false,
		answeredQuestions: {},
		loading: false,
		profileInfo:{},
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

	handleAnswerOptionClick = (isCorrect) => {
		const { score, selectedOption, currentQuestion, answeredQuestions } = this.state;
		const question = allTypeofQuiz[currentQuestion];
		const prevSelectedOption = answeredQuestions[currentQuestion];
		const prevIsCorrect = prevSelectedOption !== undefined && question.options.find((option) => option.answerText === prevSelectedOption).isCorrect;
		let newScore = score;
		if (isCorrect && !prevIsCorrect) {
			newScore += question.marks;
		}
		else if (!isCorrect && prevIsCorrect) {
			newScore -= question.marks;
		}
		this.setState({
			score: Math.max(newScore, 0),
			selectedOption: null,
		});
		const nextQuestion = currentQuestion + 1;
		if (nextQuestion < allTypeofQuiz.length) {
			this.setState({ currentQuestion: nextQuestion });
		}
		else {
			this.setState({ showScore: true });
		}
		answeredQuestions[currentQuestion] = selectedOption;
		this.setState({ answeredQuestions });
	};
	setSubmitting = (submitting) => {
		this.setState((prevState) => Object.assign({}, prevState, { submitting }));
	};
	handleSubmitButtonClick = () => {
		const { answeredQuestions, currentQuestion, selectedOption } = this.state;
		answeredQuestions[currentQuestion] = selectedOption;
		this.setState({ answeredQuestions });
		let score = 0;
		for (let i = 0; i < allTypeofQuiz.length; i++) {
			const question = allTypeofQuiz[i];
			const selectedOption = answeredQuestions[i];
			if (selectedOption !== undefined && question.options.find((option) => option.answerText === selectedOption).isCorrect){
				score += question.marks;
			}
		}
		this.setState({ score, showScore: true });
		this.setSubmitting(true);
		this.props.dispatch(setCertificationMarks(this.state.score)).then((score) => {
			this.setState({
				score:score
			});
		},(err) => {
			this.setState({
				errors: err && err.responseJSON,
			});
		}).always(() => this.setSubmitting(false));
	};
	render() {
		const margin_bottom = {
			marginBottom: "15px"
		};
		const main_div_style = {
			backgroundColor: "#f9f9f9",
			padding: "15px"
		};
		const btn_container = {
			width: "40%",
			display: "flex",
			gap: "2rem",
			marginTop: "1rem",
		};
		const nxtBtn = {
			padding: ".7rem 2rem",
			fontSize: "1.3rem",
			fontWeight: "bold",
			backgroundColor: "rgb(51,122,183)",
			color: "white",
			border: "none",
			outline: "none",
			borderRadius: "5px",
		};
		const submitBtn = {
			padding: ".7rem 2rem",
			fontSize: "1.3rem",
			fontWeight: "bold",
			backgroundColor: "green",
			color: "white",
			border: "none",
			outline: "none",
			borderRadius: "5px",
		};
		const { currentQuestion, score, selectedOption, showScore, answeredQuestions,loading } = this.state;
		const isLastQuestion = currentQuestion === allTypeofQuiz.length - 1;
		return (
			<div>
				{ loading ? <Loading/> :
					(
						<div style={main_div_style}>
							{this.state.profileInfo.certification_score ?
								(
									<div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
										<p style={{ fontSize: "2.5rem" }}> <b style={{ fontSize: "2.7rem", color: "rgb(51,122,183)" }}>Congratulations! </b> you have completed the certification and have scored</p>
										<h1 style={{ color: "rgb(51,122,183)" }}>{this.state.profileInfo.certification_score}%</h1>
										<p style={{ fontSize: "2.5rem" }}> You can now move ahead and apply for audits in the opportunities tab.</p>
									</div>
								) :
								showScore ?
									(
										<div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
											<p style={{ fontSize: "2.5rem" }}> <b style={{ fontSize: "2.7rem", color: "rgb(51,122,183)" }}>Congratulations! </b> you have completed the certification and have scored</p>
											<h1 style={{ color: "rgb(51,122,183)" }}>{score}%</h1>
											<p style={{ fontSize: "2.5rem" }}> You can now move ahead and apply for audits in the opportunities tab.</p>
										</div>
									) :
									(
										<div>
											<div style={{ fontSize: "2rem", display: "flex", justifyContent: "center", alignItems: "center" }}>
												<p> Question <b style={{ color: "rgb(51,122,183)", }}>{currentQuestion + 1}/{allTypeofQuiz.length}</b></p>
											</div>
											<h2 className="page-header">{allTypeofQuiz[currentQuestion].heading}</h2>
											<div className="row" style={margin_bottom}>
												<div style={{ padding: "2rem" }}>
													<div>
														{allTypeofQuiz[currentQuestion].extraInfo && <p style={{ fontSize: "1.5rem" }}>{allTypeofQuiz[currentQuestion].extraInfo}</p>}
														{allTypeofQuiz[currentQuestion].imgUrl &&
															<div style={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
																<img src={allTypeofQuiz[currentQuestion].imgUrl} alt="PizzaShop" style={{ maxWidth: "100%", objectFit: "contain" }} className="pizza_img" />
															</div>
														}
														{allTypeofQuiz[currentQuestion].audioUrl && <audio src={allTypeofQuiz[currentQuestion].audioUrl} controls style={{ width: "70%" }} />}
														<p style={{ fontWeight: "bold", marginTop: "1rem" }}>{allTypeofQuiz[currentQuestion].extraInfoSubheading}</p>
													</div>
													<div>
														{allTypeofQuiz[currentQuestion].questionBold ?
															<p><span>{allTypeofQuiz[currentQuestion].questionNumber}</span> <b>{allTypeofQuiz[currentQuestion].questionBold}</b>  {allTypeofQuiz[currentQuestion].question}</p>
															:
															<p style={{ fontWeight: "bold", fontSize: "1.4rem" }}>
																<span>{allTypeofQuiz[currentQuestion].questionNumber}</span>  {allTypeofQuiz[currentQuestion].question}
															</p>
														}
														{allTypeofQuiz[currentQuestion].instruction && allTypeofQuiz[currentQuestion].underline && <p>{allTypeofQuiz[currentQuestion].instruction} <u>{allTypeofQuiz[currentQuestion].underline}</u> </p>}
														{allTypeofQuiz[currentQuestion].instruction && !allTypeofQuiz[currentQuestion].underline && <p>{allTypeofQuiz[currentQuestion].instruction}</p>}
													</div>
													<div>
														{allTypeofQuiz[currentQuestion].options.map((option, index) => {
															const isChecked =
																option.answerText ===
																(selectedOption ||
																	answeredQuestions[currentQuestion] ||
																	null);
															return (
																<div key={index}>
																	<label style={{ fontWeight: "lighter" }}>
																		<input
																			type="radio"
																			name="answer"
																			value={option.answerText}
																			checked={isChecked}
																			onChange={() =>
																				this.setState({ selectedOption: option.answerText })
																			}
																			style={{ width: "35px" }}
																		/>
																		{option.answerText}
																	</label>
																</div>
															);
														})}
													</div>
													<div style={btn_container}>
														{isLastQuestion ?
															<button
																onClick={this.handleSubmitButtonClick}
																style={submitBtn}
															>
																Submit
															</button>
															:
															<button
																className="next-button"
																disabled={!selectedOption}
																onClick={() =>
																	this.handleAnswerOptionClick(
																		allTypeofQuiz[currentQuestion].options.find(
																			(option) => option.answerText === selectedOption
																		).isCorrect
																	)
																}
																style={nxtBtn}
															>
																Next
															</button>
														}
													</div>
												</div>
											</div>
										</div>
									)
							}
						</div>
					)
				}
			</div>
		);
	}
}

var mapStoreToProps = function(store){
	return {
		profileInfo: store.profileInfo || {}
	};
};

export default ReactRedux.connect(mapStoreToProps)(CertificateQuiz);