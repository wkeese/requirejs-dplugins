/**
 * Icon loading plugin.
 *
 * @example:
 *      To load the icon `myicons/myicon.svg`:
 *      ```
 *      require(["requirejs-dplugins/icon!myicons/myicon.svg"], function (){
 *          // myicon was loaded, access via <use xlink:href="#myicon">
 *      });
 *      ```
 * @module requirejs-dplugins/icon
 */

define([
	"module"
], function (module) {
	"use strict";

	// Text plugin to load the templates and do the build.
	var textPlugin = "requirejs-text/text";

	var spriteContainer;

	// Makes a symbol out of an svg icon
	function loadIcon(svgText, id) {
		if (spriteContainer.querySelector("#" + id)) {
			return;		// already added, don't add twice
		}
		var div = document.createElement("div");
		div.innerHTML = svgText;
		var svg = div.querySelector("svg"),
			symbol = document.createElementNS("http://www.w3.org/2000/svg", "symbol");
		symbol.setAttribute("id", id);
		if (svg.hasAttribute("viewBox") ) {
			symbol.setAttribute("viewBox", svg.getAttribute("viewBox"));
		}
		while (svg.firstChild) {
			symbol.appendChild(svg.firstChild);
		}
		spriteContainer.appendChild(symbol);
	}

	return {
		id: module.id,

		/**
		 * Loads an icon file.
		 * @param {string} mid - The svg file to load.
		 * @param {Function} require - A local require function to use to load other modules.
		 * @param {Function} onload - A function to call when the specified stylesheets have been loaded.
		 * @method
		 */
		load: function (mid, require, onload, loaderConfig) {
			require([textPlugin + "!" + mid], function (svgText) {
				// The build only needs the call to requirejs-text/text to work.
				if (loaderConfig.isBuild) {
					onload();
					return;
				}

				if (!spriteContainer) {
					spriteContainer = document.createElementNS("http://www.w3.org/2000/svg", "svg");
					spriteContainer.setAttribute("style", "display: none");
					document.body.appendChild(spriteContainer);
				}

				var filename = mid.replace(/.*\/(.*)\.svg$/g, "$1");
				loadIcon(svgText, filename);
				onload();
			});
		},

		/**
		 * Build function to delegate SVG inlining to requirejs-text/text.
		 * @param {string} pluginName - This module id.
		 * @param {string} moduleName - Absolute path to the resource.
		 * @param {Function} write - A function to be called with a string of output to
		 * write to the optimized file. This function also contains a property function,
		 * write.asModule(moduleName, text).
		 * @param {Object} loaderConfig - Configuration object from the loader. `requirejs-text/text`
		 * needs `loaderConfig.inlineText === true` to work.
		 * @private
		 */
		write: function (pluginName, moduleName, write, loaderConfig) {
			// Requirejs-text is not listed in the dependency list so it is not
			// included in the layer. At build time requirejs works synchronously so
			// there is no callback.
			var text = require(textPlugin);
			text.write(textPlugin, moduleName, write, loaderConfig);
		}
	};
});
