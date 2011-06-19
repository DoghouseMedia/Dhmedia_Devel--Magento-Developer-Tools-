/**
 * DevelData
 */
var DevelData = Class.create();
DevelData.prototype =
{
	initialize: function(selector)
	{
		var develData = this;
		develData.data = {};
		
		$$(selector).each(function(el) {
			eval('develData.data.' + $(el).readAttribute('rel') + '=el;');
		});
	},
	getData: function() {
		return this.data;
	}
};