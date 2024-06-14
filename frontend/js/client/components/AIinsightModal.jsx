import React, { Component } from "react";
import Modal from "../../components/Modal.jsx";
import PropTypes from "prop-types";
import { hashHistory } from "react-router";
import Loading from "../../components/Loading.jsx";
import { ResponsiveContainer, BarChart, CartesianGrid, Bar, XAxis, YAxis, Tooltip, Label } from "recharts";
import "../../../css/bs_overrides.scss";
import ReactWordcloud from "react-wordcloud";
import { fetchSentimetModalData } from "../service/twitter.js";

const options = {
	rotations: 0,
	fontSizes: [20, 60],
};

// const callbacks = {
//     onWordClick: console.log,
//     onWordMouseOver: console.log,
//     getWordTooltip: word => `${word.text} (${word.value})`,
// };
const callbacks = {
	onWordClick: null,
	onWordMouseOver: null,
	getWordTooltip: null,
};

class AiinsightModal extends Component {
	static propTypes = {
		params: PropTypes.shape({
			summaryId: PropTypes.number,
		}),
	};

	constructor(props) {
		super(props);
		this.state = {
			loading: false,
			error: false,
			sentiments: {},
			fullyLoaded: false,
		};
	}
	componentDidMount() {
		this.setState({ loading: true });
		fetchSentimetModalData(this.props.params.summaryId).then((result) => {
			this.setState({
				loading: false,
				sentiments: result[0],
			});
		});
	}
	renderBulletPoints(bulletPoints) {
		return Object.values(bulletPoints).map((point, index) => <li key={index}>{point}</li>);
	}

	renderPositiveKeywords(keywords) {
		return Object.entries(keywords).map(([word, count], index) => (
			<div className="ai_words_smallbox" key={index}>
				<p>{word} : <span>{count}</span></p>
			</div>
		));
	}

	renderNegativeKeywords(keywords) {
		return Object.entries(keywords).map(([word, count], index) => (
			<div className="ai_words_smallbox ai_negative" key={index}>
				<p>{word} : <span>{count}</span></p>
			</div>
		));
	}

	renderPositiveKeywordsWordCloud(keywords) {
		if (!keywords || typeof keywords !== "object") return []; // Handle non-iterable case
		return Object.entries(keywords).map(([word, count]) => ({
			text: word,
			value: count,
			color: "green"
		}));
	}

	renderNegativeKeywordsWordCloud(keywords) {
		if (!keywords || typeof keywords !== "object") return []; // Handle non-iterable case
		return Object.entries(keywords).map(([word, count]) => ({
			text: word,
			value: count,
			color: "red"
		}));
	}

	prepareEmotionData(emotions) {
		return Object.entries(emotions).map(([emotion, value]) => ({ name: emotion, value }));
	}

	render() {
		const { sentiments, loading } = this.state;
		const bulletPoints = sentiments.bullet_points || "";
		const positiveKeywords = sentiments.sentiment_positive_words || {};
		const negativeKeywords = sentiments.sentiment_negative_words || {};
		const emotionData = this.prepareEmotionData(sentiments.sentiment_emotions || {});
		// const wordCloudData = [
		//     ...this.renderPositiveKeywordsWordCloud(positiveKeywords),
		//     ...this.renderNegativeKeywordsWordCloud(negativeKeywords)
		// ];
		const positiveWordCloudData = this.renderPositiveKeywordsWordCloud(positiveKeywords);
		const negativeWordCloudData = this.renderNegativeKeywordsWordCloud(negativeKeywords);
		const wordCloudData = [...positiveWordCloudData, ...negativeWordCloudData];

		return (
			<Modal modalTitle="Sentimental Analysis" size="modal-lg" onClose={hashHistory.goBack}>
				{loading ?
					<Loading />
					:
					<div className="ai_modal_mainbox">
						<div className="ai_modal_smbox ">
							<h3>Audit Highlights</h3>
							<ul className="bullet_box">
								{this.renderBulletPoints(bulletPoints)}
							</ul>
						</div>
						<div className="ai_modal_smbox">
							<h3>Report word cloud</h3>
							<div className="word_cloud_box">
								<ReactWordcloud options={options} words={wordCloudData} callbacks={callbacks}/>
							</div>
							<h3>Customer emotions</h3>
							<div style={{ marginTop: "3rem" }}>
								<ResponsiveContainer width="100%" aspect={3 / 1} >
									<BarChart width={700} height={370} data={emotionData}>
										<CartesianGrid strokeDasharray="3 3" />
										<XAxis dataKey="name">
											<Label value="Emotions" offset={0} position="insideBottom" fill="#337ab7" />
										</XAxis>
										<YAxis domain={[0, 1]} tickFormatter={f => f }>
											<Label value="Values" angle={-90} position="insideLeft" fill="#337ab7" />
										</YAxis>
										<Tooltip formatter={v => v === null ? "N/A" : v } />
										<Bar dataKey="value" barSize={20} isAnimationActive={false} fill={"#337ab7"}>
										</Bar>
									</BarChart>
								</ResponsiveContainer>
							</div>
						</div>
						<div className="ai_modal_smbox">
							<h3>Positive keywords</h3>
							<div className="ai_words_mainbox positive_mainbox">
								{this.renderPositiveKeywords(positiveKeywords)}
							</div>
							<h3>Negative keywords</h3>
							<div className="ai_words_mainbox negative_mainbox">
								{this.renderNegativeKeywords(negativeKeywords)}
							</div>
						</div>
					</div>
				}

			</Modal>
		);
	}
}

export default AiinsightModal;
