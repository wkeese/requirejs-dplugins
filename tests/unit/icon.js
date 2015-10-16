define([
	"intern!object",
	"intern/chai!assert"
], function (registerSuite, assert) {
	function getContextRequire() {
		return require.config({
			context: "icon", // TODO: increment this
			baseUrl: "../../../requirejs-dplugins",
			paths: {lie: "../lie", 'requirejs-text': '../text/text' },
			config: {
				"icon": {
					layersMap: {
						"tests/unit/resources/icons/never-loaded.svg": "tests/unit/resources/icons/sprite.svg"
					}
				}
			}
		});
	}

	var CONTAINER_ID = "requirejs-dplugins-icons";

	registerSuite({
		name: "icon plugin",
		"Checking sprite is correctly created": function () {
			var dfd = this.async();
			var contextRequire = getContextRequire();
			contextRequire([
				"icon!tests/unit/resources/icons/icon1.svg",
				"icon!tests/unit/resources/icons/icon2.svg"
			], dfd.callback(function () {
				var spriteContainer = document.getElementById(CONTAINER_ID);
				assert.isNotNull(spriteContainer, "Sprite was correctly created");
				var icon1 = spriteContainer.querySelector("symbol#icon1"),
					icon2 = spriteContainer.querySelector("symbol#icon2"),
					inexistentIcon = spriteContainer.querySelector("symbol#inexistent-icon"),
					symbols = spriteContainer.querySelectorAll("symbol");
				assert.isNotNull(icon1, "icon1 was correctly added");
				assert.isNotNull(icon2, "icon2 was correctly added");
				assert.isNull(inexistentIcon, "inexistent-icon was not found as expected");
				assert.strictEqual(symbols.length, 2, "total number of symbols found is correct")
			}));
		},
		"Checking icons are correctly added to sprite": function () {
			var dfd = this.async();
			var contextRequire = getContextRequire();

			contextRequire([
				"icon!tests/unit/resources/icons/icon1.svg",
				"icon!tests/unit/resources/icons/icon1_2x.svg"
			], dfd.callback(function () {
				var spriteContainer = document.getElementById(CONTAINER_ID);
				var icon32 = spriteContainer.querySelector("symbol#icon1"),
					icon64 = spriteContainer.querySelector("symbol#icon1_2x");
				var viewBox32 = icon32.getAttribute("viewBox"),
					viewBox64 = icon64.getAttribute("viewBox");
				assert.strictEqual(viewBox32, "0 0 32 32", "viewBox was correctly set on the symbol")
				assert.strictEqual(viewBox64, "0 0 64 64", "viewBox was correctly set on the symbol")
			}));
		},
		"Checking icons can't be added twice": function () {
			var dfd = this.async();
			var contextRequire = getContextRequire();
			contextRequire([
				"icon!tests/unit/resources/icons/icon1.svg",
				"icon!tests/unit/resources/icons/icon1.svg"
			], dfd.callback(function () {
				var spriteContainer = document.getElementById(CONTAINER_ID);
				var icons = spriteContainer.querySelectorAll("symbol#icon1");
				assert.strictEqual(icons.length, 1, "Icon was not added twice")
			}));
		},
		"Checking icons defined in sprite can't be reloaded": function () {
			var dfd = this.async();
			var contextRequire = getContextRequire();
			contextRequire([
				"icon!tests/unit/resources/icons/never-loaded.svg"
			], dfd.callback(function () {
				var spriteContainer = document.getElementById(CONTAINER_ID);
				var icons = spriteContainer.querySelectorAll("symbol#never-loaded");
				assert.strictEqual(icons.length, 0, "Icon was not loaded")
			}));
		},
		teardown: function () {
			var spriteContainer = document.getElementById(CONTAINER_ID);
			spriteContainer.parentNode.removeChild(spriteContainer);
			// FIXME: requirejs-dplugins/icon is cache is left unreset
		}
	});
});
