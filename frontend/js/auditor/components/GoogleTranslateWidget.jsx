import React, { useEffect, useRef } from "react";

const GTranslateWidget = () => {
	const wrapperRef = useRef(null);

	useEffect(() => {
		const wrapperSelector = ".gtranslate_wrapper";

		if (!window.gtranslateSettings) {
			window.gtranslateSettings = {
				default_language: "en",
				native_language_names: true,
				detect_browser_language: true,
				languages: ["en", "fr", "de", "it", "es", "ar", "hi" ,"nl", "ja", "ru", "th","bg","ja","zh-TW","ko","id","pt","tr","af","ms"],
				wrapper_selector: wrapperSelector,
				flag_size: 16,
				switcher_horizontal_position: "right",
				switcher_vertical_position: "inline",
				alt_flags: { en: "usa" },
			};

			const popupScript = document.createElement("script");
			popupScript.src = "https://cdn.gtranslate.net/widgets/latest/popup.js";
			popupScript.defer = true;

			document.body.appendChild(popupScript);
		} else {
			window.GTranslateWidget && window.GTranslateWidget.translate(wrapperSelector);
		}

		return () => {
			const widgetElement = document.querySelector(".gtranslate_widget");
			if (widgetElement) {
				widgetElement.remove();
			}
		};
	}, []);

	// Inline styles for the dropdown button
	const dropdownButtonStyles = {
		width: "120px", // Adjust the width as needed
	};

	return (
		<div ref={wrapperRef} className="gtranslate_wrapper">
			{/* Inline styles applied to the dropdown button */}
			<style>{`.goog-te-combo { ${Object.entries(dropdownButtonStyles).map(([key, value]) => `${key}: ${value};`).join(" ")} }`}</style>
		</div>
	);
};

export default GTranslateWidget;
