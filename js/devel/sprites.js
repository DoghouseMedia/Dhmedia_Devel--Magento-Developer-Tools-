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
			$(span).addClassName('sprite-icon');
			el.appendChild(span);
		});
	}
};