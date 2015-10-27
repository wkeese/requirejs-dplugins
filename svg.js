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
	"./has",
	"./Promise!",
	"module",
	"requirejs-text/text",
	"requirejs-domready/domReady"
], function (require, has, Promise, module, text) {
	"use strict";

	var loaded = {}, // paths of loaded svgs
		SPRITE_ID = 'requirejs-dplugins-svg',
		sprite = null;


	var loadSVG = {
		id: module.id,

		/**
		 * Loads an svg file.
		 * @param {string} path - The svg file to load.
		 * @param {Function} require - A local require function to use to load other modules.
		 * @param {Function} onload - A function to call when the specified svg file have been loaded.
		 * @method
		 */
		load: function (path, require, onload) {
			if (has("builder")) { // when building
				loaded[path] = true;
				onload();
			} else { // when running
				// special case: when running a built version
				// Replace graphic by corresponding sprite.
				var idInLayer;
				var layersMap = module.config().layersMap;
				if (layersMap && layersMap[path]) {
					idInLayer = layersMap[path].id;
					path = layersMap[path].redirectTo;
				}

				if (!(path in loaded)) {
					loaded[path] = new Promise(function (resolve) {
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
							resolve(idInLayer || symbol.getAttribute("id"));
						});
					});
				}

				loaded[path].then(function (symbolId) {
					onload(symbolId);
				});
			}
		}
	};

	if (has("builder")) {
		loadSVG.write = function (pluginName, moduleName, write, loaderConfig) {
			// Delegate to requirejs-text/text! plugin to load text into JS layer.
			text.write(textPlugin, moduleName, write, loaderConfig);
		};
	}

	return loadSVG;

	// makes a symbol out of an svg graphic
	function extractGraphicAsSymbol(document, svgText) {
		var div = document.createElement("div");
		div.innerHTML = svgText;
		var element = div.querySelector("svg"),
			id = element.getAttribute("id"),
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
		typeof id === "string" && symbol.setAttribute("id", id);
		typeof viewBox === "string" && symbol.setAttribute("viewBox", viewBox);
		return symbol;
	}

	// creates empty sprite
	function createSprite(document, id) {
		var sprite = document.createElementNS("http://www.w3.org/2000/svg", "svg");
		sprite.setAttribute("style", "display: none");
		id && sprite.setAttribute("id", id);
		return sprite;
	}
});
