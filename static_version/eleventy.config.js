import { eleventyImageTransformPlugin } from "@11ty/eleventy-img";
import eleventyNavigationPlugin from "@11ty/eleventy-navigation";
import syntaxHighlight from "@11ty/eleventy-plugin-syntaxhighlight";

export default async function(eleventyConfig) {
	eleventyConfig.addPlugin(eleventyImageTransformPlugin, {
		formats: ["avif", "webp", "jpeg"],
		widths: [400, 800, 1200, "auto"],
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
	 * Usage: {% portraitGrid "Mobile caption", "url1", "Caption 1", "url2", "Caption 2", ... %}
	 */
	eleventyConfig.addShortcode("portraitGrid", function(mobileCaption, ...args) {
		const images = [];
		for (let i = 0; i < args.length; i += 2) {
			if (args[i]) images.push({ url: args[i], caption: args[i + 1] || "" });
		}

		const columns = images.map(({ url, caption }) => `
  <div class="wp-block-column">
    <figure class="wp-block-image">
      <a href="${url}?w=1500&h=2000&fit=crop" class="pswp-link" data-pswp-width="1500" data-pswp-height="2000" target="_blank">
        <img src="${url}?w=600&h=800&fit=crop" alt="" class="grid-image-portrait" width="600" height="800" sizes="(min-width: 600px) 260px, 33vw">
      </a>${caption ? `\n      <figcaption>${caption}</figcaption>` : ""}
    </figure>
  </div>`).join("");

		return `<div class="wp-block-columns pswp-gallery" style="margin-top: var(--wp--preset--spacing--40); margin-bottom: 0;">${columns}
</div>
<div class="grid-wide-caption">${mobileCaption}</div>`;
	});

	/**
	 * imageGallery — PhotoSwipe gallery: one wide landscape image + N smaller images in a row.
	 * Usage: {% imageGallery "Mobile caption", "wideUrl", "Wide caption", "url2", "url3", ... %}
	 * The first image is always wide; all remaining args are small image URLs (no captions).
	 */
	eleventyConfig.addShortcode("imageGallery", function(mobileCaption, wideUrl, wideCaption, ...smallUrls) {
		const wideHtml = wideUrl ? `
  <figure class="wp-block-image" style="margin-bottom: var(--wp--preset--spacing--50);">
    <a href="${wideUrl}?w=2400&h=1200&fit=crop" class="pswp-link" data-pswp-width="2400" data-pswp-height="1200" target="_blank">
      <img src="${wideUrl}?w=1200&h=600&fit=crop" alt="" class="grid-image-large" width="1200" height="600" sizes="(min-width: 600px) 600px, 100vw">
    </a>${wideCaption ? `\n    <figcaption>${wideCaption}</figcaption>` : ""}
  </figure>` : "";

		const smallCols = smallUrls.filter(Boolean).map(url => `
    <div class="wp-block-column">
      <a href="${url}?w=2000&h=1500&fit=crop" class="pswp-link" data-pswp-width="2000" data-pswp-height="1500" target="_blank">
        <img src="${url}?w=600&h=450&fit=crop" alt="" class="grid-image" width="600" height="450" sizes="(min-width: 600px) 300px, 50vw">
      </a>
    </div>`).join("");

		const smallHtml = smallCols ? `
  <div class="wp-block-columns" style="margin-bottom: 0;">${smallCols}
  </div>` : "";

		return `<div class="wp-block-group pswp-gallery">${wideHtml}${smallHtml}
  <div class="grid-wide-caption">${mobileCaption}</div>
</div>`;
	});

	/**
	 * details — Paired shortcode wrapping content in the animated-details disclosure component.
	 * Usage: {% details "Summary label" %}...content...{% enddetails %}
	 */
	eleventyConfig.addPairedShortcode("details", function(content, summary) {
		return `<details class="animated-details">
  <summary>
    <span class="details-marker">
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M9 6L15 12L9 18" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
    </span>
    ${summary}
  </summary>
  <div class="details-content" style="padding-top: var(--wp--preset--spacing--40);">
    ${content}
  </div>
</details>`;
	});

	return {
		markdownTemplateEngine: "njk",
		dir: {
			input: "src",
			output: "_site",
			includes: "_includes"
		}
	};
};
