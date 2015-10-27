/**
 * Svg loading plugin.
 *
 * This plugin loads an svg graphic and defines it in the DOM, so you can reference it in a `<use>` tag.
 *
 * @example:
 *      To load the svg file `myicons/myicon.svg`:
 *      ```
 *      require(["requirejs-dplugins/svg!myicons/myicon.svg"], function (myiconId){
 *          // myicon was added to the DOM
 *      });
 *      ```
 * @module requirejs-dplugins/svg
 */

define([
	"require",
	"module",
	"requirejs-text/text",
	"requirejs-domready/domReady"
], function (require, module, text) {
	"use strict";

	var SPRITE_ID = 'requirejs-dplugins-svg',
		sprite = null,
		idSeq = 1;	// For generating unique IDs.  Alternately could use path.


	return {
		id: module.id,

		/**
		 * Loads an svg file.
		 * @param {string} path - The svg file to load.
		 * @param {Function} require - A local require function to use to load other modules.
		 * @param {Function} onload - A function to call when the specified svg file have been loaded.
		 * @method
		 */
		load: function (path, require, onload) {
			require([
				'requirejs-text/text!' + path,
				"requirejs-domready/domReady!"
			], function (svgText) {
				if (!sprite) {
					sprite = createSprite(document, SPRITE_ID);
					document.body.appendChild(sprite);
				}
				var symbol = extractGraphicAsSymbol(document, svgText);
				sprite.appendChild(symbol);
				onload(symbol.getAttribute("id"));
			});
		},

		write: function (pluginName, moduleName, write, loaderConfig) {
			// Delegate to requirejs-text/text! to inline text into JS layer.
			text.write(textPlugin, moduleName, write, loaderConfig);
		}
	};

	// makes a symbol out of an svg graphic
	function extractGraphicAsSymbol(document, svgText) {
		var div = document.createElement("div");
		div.innerHTML = svgText;
		var element = div.querySelector("svg"),
			id = 'requirejs-dplugins-svg-' + idSeq++,
			viewBox = element.getAttribute("viewbox") || element.getAttribute("viewBox"),
			symbol = createSymbol(document, id, element, viewBox);
		return symbol;
	}

	// makes symbol from svg element
	function createSymbol(document, id, element, viewBox) {
		var symbol = document.createElementNS("http://www.w3.org/2000/svg", "symbol");
		while (element.firstChild) {
			symbol.appendChild(element.firstChild);
		}
		symbol.setAttribute("id", id);
		typeof viewBox === "string" && symbol.setAttribute("viewBox", viewBox);
		return symbol;
	}

	// creates empty sprite
	function createSprite(document, id) {
		var sprite = document.createElementNS("http://www.w3.org/2000/svg", "svg");
		sprite.setAttribute("style", "display: none");
		sprite.setAttribute("id", id);
		return sprite;
	}
});
