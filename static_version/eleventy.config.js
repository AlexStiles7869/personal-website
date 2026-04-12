import { eleventyImageTransformPlugin } from "@11ty/eleventy-img";
import eleventyNavigationPlugin from "@11ty/eleventy-navigation";
import syntaxHighlight from "@11ty/eleventy-plugin-syntaxhighlight";
import nunjucks from "nunjucks";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Nunjucks environment for rendering shortcode templates
const shortcodeEnv = new nunjucks.Environment(
	new nunjucks.FileSystemLoader(path.join(__dirname, "src/_includes"))
);

export default async function(eleventyConfig) {
	let resumeButton = process.env.RESUME_BUTTON !== 'false';
	let blogPage = process.env.BLOG_PAGE !== 'false';
	eleventyConfig.addGlobalData("flags", { resumeButton, blogPage });

	eleventyConfig.addPlugin(eleventyImageTransformPlugin, {
		formats: ["avif", "webp", "jpeg"],
		widths: [400, 800, 1200, "auto"],
		urlPath: "/img/",
		outputDir: "img", // Relative to output directory (_site)
		defaultAttributes: {
			loading: "lazy",
			decoding: "async",
		},
	});

	eleventyConfig.addPlugin(eleventyNavigationPlugin);
	eleventyConfig.addPlugin(syntaxHighlight);

	eleventyConfig.setServerOptions({
		showVersion: true,
		domDiff: true,
		port: 8080,
		host: "0.0.0.0",
	});

	eleventyConfig.addPassthroughCopy("src/assets");

	// --- Shortcodes ---

	/**
	 * portraitGrid — PhotoSwipe portrait column grid with per-image captions and a mobile wide caption.
	 * Template: src/_includes/shortcodes/portrait-grid.njk
	 * Usage: {% portraitGrid "Mobile caption", "url1", "Caption 1", "url2", "Caption 2", ... %}
	 */
	eleventyConfig.addShortcode("portraitGrid", function(mobileCaption, ...args) {
		const images = [];
		for (let i = 0; i < args.length; i += 2) {
			if (args[i]) images.push({ url: args[i], caption: args[i + 1] || "" });
		}
		return shortcodeEnv.render("shortcodes/portrait-grid.njk", { mobileCaption, images });
	});

	/**
	 * imageGallery — PhotoSwipe gallery: one wide landscape image + N smaller images in a row.
	 * Template: src/_includes/shortcodes/image-gallery.njk
	 * Usage: {% imageGallery "Mobile caption", "wideUrl", "Wide caption", "url2", "url3", ... %}
	 */
	eleventyConfig.addShortcode("imageGallery", function(mobileCaption, wideUrl, wideCaption, ...smallUrls) {
		return shortcodeEnv.render("shortcodes/image-gallery.njk", {
			mobileCaption,
			wideUrl,
			wideCaption,
			smallUrls: smallUrls.filter(Boolean),
		});
	});

	/**
	 * details — Paired shortcode wrapping content in the animated-details disclosure component.
	 * Template: src/_includes/shortcodes/details.njk
	 * Usage: {% details "Summary label" %}...content...{% enddetails %}
	 */
	eleventyConfig.addPairedShortcode("details", function(content, summary) {
		return shortcodeEnv.render("shortcodes/details.njk", { summary, content });
	});

	eleventyConfig.addFilter("beforeMore", (content) => {
		const marker = "[[MORE]]";
		const pMarker = `<p>${marker}</p>`;
		
		let index = content.indexOf(pMarker);
		if (index !== -1) return content.substring(0, index).trim();
		
		index = content.indexOf(marker);
		if (index !== -1) return content.substring(0, index).trim();
		
		return content; // If no marker, return full content as excerpt
	});

	eleventyConfig.addFilter("afterMore", (content) => {
		const marker = "[[MORE]]";
		const pMarker = `<p>${marker}</p>`;
		
		let index = content.indexOf(pMarker);
		if (index !== -1) return content.substring(index + pMarker.length).trim();
		
		index = content.indexOf(marker);
		if (index !== -1) return content.substring(index + marker.length).trim();
		
		return ""; // If no marker, nothing to expand
	});

	return {
		markdownTemplateEngine: "njk",
		htmlTemplateEngine: "njk",
		dir: {
			input: "src",
			output: "_site",
			includes: "_includes"
		}
	};
};

