/**
 * Icon loading plugin.
 *
 * This plugins loads SVG files and merges them into one SVG sprite
 *
 * @example:
 *      To load the icon `myicons/myicon.svg`:
 *      ```
 *      require(["requirejs-dplugins/icon!myicons/myicon.svg"], function (){
 *          // myicon was added to the sprite
 *      });
 *      ```
 * @module requirejs-dplugins/icon
 */

define([
	"./has",
	"module",
	"./icon/common"
], function (has, module, common) {
	"use strict";

	var cache = common.cache, // paths of loaded icons
		icons = common.icons; // markup of loaded icons


	var loadIcon = {
		id: module.id,

		/*jshint maxcomplexity: 11*/
		/**
		 * Loads an icon file file.
		 * @param {string} args - The css file to load.
		 * @param {Function} require - A local require function to use to load other modules.
		 * @param {Function} onload - A function to call when the specified stylesheets have been loaded.
		 * @method
		 */
		load: function (args, require, onload) {
			if (has("builder")) { // when building
				cache[args] = true;
			} else { // when running

				// special case: when running a built version
				// Replace single css bundles by corresponding layer.
				var layersMap = module.config().layersMap;
				if (layersMap) {
					args = layersMap[args] || args;
				}

				try {
					if (args in cache) {
						onload();
					} else {
						cache[args] = true;
						common.spriteContainer = common.spriteContainer || common.createContainer();
						require(['requirejs-text!' + args], function (svg) {
							var filename = common.getFilename(args),
								icon = common.extractIcon(svg, filename);
							icons.push(icon);
							common.spriteContainer.innerHTML = common.generateSprite(icons);
							onload();
						});
					}
				} catch (e) {
					onload();
				}
			}


		}
	};

	if (has("builder")) {
		// build variables
		var writePluginFiles;

		var buildFunctions = {
			/**
			 * Write the layersMap configuration to the corresponding modules layer.
			 * The configuration will look like this:
			 *
			 * @param {Function} write - This function takes a string as argument
			 * and writes it to the modules layer.
			 * @param {string} mid - Current module id.
			 * @param {string} dest - Current icon sprite path.
			 * @param {Array} loadList - List of icon files contained in current sprite.
			 */
			writeConfig: function (write, mid, destMid, loadList) {
				var iconConf = {
					config: {},
					paths: {}
				};
				iconConf.config[mid] = {
					layersMap: {}
				};
				loadList.forEach(function (path) {
					iconConf.config[mid].layersMap[path] = destMid;
				});

				write("require.config(" + JSON.stringify(iconConf) + ");");
			},

			/**
			 * Concat all icons files required by a modules layer and write the result.
			 *
			 * @param {Function} writePluginFiles - The write function provided by the builder to `writeFile`.
			 * and writes it to the modules layer.
			 * @param {string} dest - Current icon sprite path.
			 * @param {Array} loadList - List of icons contained in current sprite.
			 * @returns {boolean} Return `true` if the function successfully writes the layer.
			 */
			writeLayer: function (writePluginFiles, dest, loadList) {
				var fs = require.nodeRequire("fs"),
					cheerio = require.nodeRequire("cheerio");

				var icons = loadList.map(function (path) {
					var filename = common.getFilename(path),
						svg = fs.readFileSync(require.toUrl(path), "utf8");
					return common.extractIcon(svg, filename, cheerio);
				});

				var sprite = common.generateSprite(icons);

				writePluginFiles(dest, sprite);
				return true;
			}
		};


		loadIcon.writeFile = function (pluginName, resource, require, write) {
			writePluginFiles = write;
		};

		loadIcon.addModules = function (pluginName, resource, addModules) {
			addModules(["requirejs-text"]);
		};

		loadIcon.onLayerEnd = function (write, layer) {
			if (layer.name && layer.path) {
				var dest = layer.path.replace(/^(.*\/)?(.*).js$/, "$1/$2.svg"),
					destMid = layer.name + ".svg";

				var loadList = Object.keys(cache);

				// Write layer file and config
				var success = buildFunctions.writeLayer(writePluginFiles, dest, loadList);
				if (success) {
					buildFunctions.writeConfig(write, module.id, destMid, loadList);
				}

				// Reset cache
				cache = {};
			}
		};

	}

	return loadIcon;
});
