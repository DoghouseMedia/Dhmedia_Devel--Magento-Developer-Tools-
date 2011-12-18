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
		var span = document.createElement('span');
		el.appendChild(span);
		span.innerHTML = "Checking for updates...";
		span.className = 'devel-notification-label';
		
		new Ajax.Request(this.hasUpdateUrl, {
			method:'get',
			onSuccess: function(transport) {
				var labelHtml = false;
				var contentHtml = false;

				if (transport.responseJSON["list-upgrades"]) {
					var data = transport
						.responseJSON["list-upgrades"]
						.data;
					
					span.innerHTML = 'Updates available!';
					contentHtml = '<table>';
					for (var channelKey in data) {
						contentHtml += '<thead>';
						contentHtml += '<tr>';
						contentHtml += '<th colspan="3">' + channelKey + '</th>';
						contentHtml += '</tr>';
						contentHtml += '<tr>';
						contentHtml += '<th>Extension name</th>';
						contentHtml += '<th>From</th>';
						contentHtml += '<th>To</th>';
						contentHtml += '</tr>';
						contentHtml += '</thead>';
						contentHtml += '<tbody>';
						for (var extensionKey in data[channelKey]) {
							contentHtml += '<tr>';
							contentHtml += '<td>';
							contentHtml += extensionKey;
							contentHtml += '</td>';
							contentHtml += '<td>';
							contentHtml += data[channelKey][extensionKey].from
							contentHtml += '</td>';
							contentHtml += '<td>';
							contentHtml += data[channelKey][extensionKey].to;
							contentHtml += '</td>';
							contentHtml += '</tr>';
						}
						contentHtml += '</tbody>';
					}
					contentHtml += '</table>';
				} else {
					span.innerHTML = 'No updates';
				}
				
				if (contentHtml) {
					var div = document.createElement('div');
					div.innerHTML = contentHtml;
					div.className = 'devel-notification-content';
					el.appendChild(div);
				}
			}
		});
	}
};