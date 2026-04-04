import { eleventyImageTransformPlugin } from "@11ty/eleventy-img";
import eleventyNavigationPlugin from "@11ty/eleventy-navigation";
import syntaxHighlight from "@11ty/eleventy-plugin-syntaxhighlight";

export default async function(eleventyConfig) {
	eleventyConfig.addPlugin(eleventyImageTransformPlugin, {
		// which formats to generate
		formats: ["avif", "webp", "jpeg"],
		
		// widths to generate for all images
		widths: [400, 800, 1200, "auto"],

		// optional: attributes to add to the generated <picture> or <img>
		defaultAttributes: {
			loading: "lazy",
			decoding: "async",
		},
	});

	eleventyConfig.addPlugin(eleventyNavigationPlugin);
	eleventyConfig.addPlugin(syntaxHighlight);

	eleventyConfig.addPassthroughCopy("src/assets");

	return {
		dir: {
			input: "src",
			output: "_site",
			includes: "_includes"
		}
	};
};
