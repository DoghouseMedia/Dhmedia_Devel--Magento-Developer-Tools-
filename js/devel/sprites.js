/**
 * DevelSprites
 */
var DevelSprites = Class.create();
DevelSprites.prototype =
{
	initialize: function(selector)
	{
		$$(selector).each(function(el){
			var span = document.createElement('span');
			$(span).addClassName('devel-sprite-icon');
			el.appendChild(span);
		});
	}
};