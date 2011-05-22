/**
 * DevelSprites
 */
var DevelSprites = Class.create();
DevelSprites.prototype =
{
	initialize: function(selector)
	{
		var sprite = this;
		
		$$(selector).each(function(el){
			sprite.add(el);
		});
	},
	add: function(el)
	{
		var span = document.createElement('span');
		$(span).addClassName('devel-sprite-icon');
		el.appendChild(span);
	}
};