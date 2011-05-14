/**
 * DevelForms
 */
var DevelForms = Class.create();
DevelForms.prototype =
{
	initialize: function(selector)
	{
		this.selector = selector;
		this.submitListener = this.postJson.bindAsEventListener(this);
		
		$$(this.selector)
			.invoke('observe', 'submit', this.submitListener); // add our observer
	},
	handleError: function()
	{
		console.log('DEVEL ERROR', data);
		alert('Something went wrong. Check your console.');
	},
	postJson: function(e)
	{	
		var develForm = this;
		var form = e.target;
		
		form.request({
			onFailure: function(data) {
				develForm.handleError(data);
			},
			onSuccess: function(data) {
				if (! data.responseJSON.status) {
					develForm.handleError(data);
				}

				/* @todo: do this better. format the json so it's foldable! */
				console.log(data.responseJSON);
				
				//var result = form.select('.result')[0];
				//result.addClassName('show');
				//result.update('<pre>' + data.responseText.contents + '</pre>');
			}
		});

		Event.stop(e); // stop the form from submitting
	}
};

/**
 * DevelUpdateNotifier
 */
var DevelUpdateNotifier = Class.create();
DevelUpdateNotifier.prototype =
{
	initialize: function(selector, hasUpdateUrl)
	{
		var notifier = this;
		notifier.hasUpdateUrl = hasUpdateUrl;

		$$(selector).each(function(el) {
			notifier.getStatus(el);
		});
	},
	getStatus: function(el)
	{
		new Ajax.Request(this.hasUpdateUrl, {
			method:'get',
			onSuccess: function(transport) {
				/* @todo: when backend implements JSON for notifiers, use something like this: */
				//el.innerHtml = transport.responseJSON.text;
				//transport.responseJSON.classes.each(function(classname){
				//	el.addClassName(classname);
				//});
				if (transport.responseText == 'Y') {
					var html = '<font style="color:orange;">Update available!</font>';
					el.addClassName('has-update');
				} else if (transport.responseText == 'N') {
					var html = '<font style="color:green;">Latest and greatest!</font>';
				} else {
					var html = '<font style="color:grey;">Could not check for updates...</font>';
				}
				
				var span = document.createElement('span');
				span.innerHTML = html;
				el.appendChild(span);
				//el.innerHTML = html;
			}
		});
	}
};