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

	function generateSvg(id, icon, viewBox) {
		return "<svg xmlns='http://www.w3.org/2000/svg' version='1.1' style='display: none'>\n" +
			"<symbol viewBox='" + viewBox + "' id='" + id + "'>" + icon + "</symbol>"
			+ "\n" + "</svg>";
	}

	// This compensates for the fact that <svg>.innerHTML doesn't work in the browser
	function _innerSVG(element) {
		var div = document.createElement("div");

		for (var i = 0, l = element.childNodes.length; i < l; i++) {
			var node = element.childNodes[i];
			div.appendChild(node.cloneNode(true));
		}
		return div.innerHTML;
	}

	function getFilename(filepath) {	// takes a path and returns the filename
		return filepath.replace(/.*\/(.*)\.svg$/g, "$1");
	}

	function extractIcon(svg, filename) {// Makes a symbol out of an svg icon
		if (document.getElementById(filename)) {
			return;		// already added to document, don't add twice
		}
		var div = document.createElement("div");
		div.innerHTML = svg;
		svg = div.querySelector("svg");
		var icon = _innerSVG(svg);
		var viewBox = svg.getAttribute("viewBox") || "";
		document.body.innerHTML += generateSvg(filename, icon, viewBox);
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

				var filename = getFilename(mid);
				extractIcon(svgText, filename);
				onload();
			}.bind(this));
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
