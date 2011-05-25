/**
 * DevelHints
 */
var DevelHints = Class.create();
DevelHints.prototype =
{
	initialize: function(selector)
	{
		this.selector = selector;
		
		$$(this.selector).each(function(domHintContainer){
			new DevelHintContainer(domHintContainer);
		});
	}
};

/**
 * DevelHintContainer
 */
var DevelHintContainer = Class.create();
DevelHintContainer.prototype =
{
	initialize: function(domHintContainer)
	{
		var hintContainer = this;
		hintContainer.dom = domHintContainer;
		hintContainer.hints = [];
		
		hintContainer.tooltip = $(hintContainer.dom).select('.tooltip')[0];
		$(hintContainer.tooltip).observe('click', 
			hintContainer.clickTooltip.bindAsEventListener(this)
		);
		
		$(hintContainer.dom).select('.hint').each(function(domHint) {
			var className = 'DevelHint' + domHint.readAttribute('rel');
			eval("var hint = new " + className + "(domHint);");
			hintContainer.hints.push(hint);
		});
	},
	clickTooltip: function(e)
	{	
		console.log('INSPECT', e.target, this.hints);
		
		$(this.hints).each(function(hint){
			console.log(hint.getTitle(), hint.getData());
		});
		
		
		Event.stop(e);
	}
};

/**
 * DevelHint
 */
var DevelHint = Class.create();
DevelHint.prototype =
{
	initialize: function(dom)
	{
		if (!dom) return;
		
		this.dom = dom;
		
		$(this.dom).hide();
	},
	getTitle: function()
	{
		return $(this.dom).readAttribute('title');
	},
	getData: function()
	{
		return $(this.dom).select('.devel-data-json')[0].innerHTML.evalJSON();
	}
};

/**
 * DevelHintLayout
 */
var DevelHintLayout = Class.create();
DevelHintLayout.prototype = Object.extend(new DevelHint(),
{
	click: function(e)
	{	
		var el = e.target;
		
		console.log(this.getData());
		
		return;
		
		var name = el.title;

		DevelGlobals.PanelManager.get('dhmedia_devel_block_panel_docs').load(data.docs.url);

		var content = '';
		var editorIds = [];

		content += '<h1>Block XML</h1>';
		data.layout.each(function(layout){
			content += '<h2>' + layout.file + '</h2>';
			content += '<em>' + layout.path + '</em>';
			content += ' - <a target="devel-editor" href="' + layout.url 
				+ '" onclick="DevelGlobals.PanelManager.get(\'dhmedia_devel_block_panel_editor\').open();">Edit</a>';
			layout.xml.each(function(xml, i){

				xml = xml.replace(/\[\[/g, '<');
				xml = xml.replace(/\]\]/g, '>');
				xml = xml.replace(/\'\'/g, '"');

				var editorId = layout.file + '-' + i;
				
				content += '<textarea id="' + editorId +'">';
				content += xml;
				content += '</textarea>';

				editorIds.push(editorId);
			});
		});
		
		DevelGlobals.PanelManager.get('dhmedia_devel_block_panel_block').setContent(content);

		editorIds.each(function(editorId){
			CodeMirror.fromTextArea(document.getElementById(editorId), {
			    lineNumbers: true,
			    matchBrackets: true,
			    mode: "application/xml",
			    indentUnit: 8,
			    indentWithTabs: true,
			    enterMode: "keep",
			    tabMode: "shift",
			    //readOnly: true
			});
		});
		
		DevelGlobals.PanelManager.get('dhmedia_devel_block_panel_block').open();
		
		console.log('HINT BLOCK', name, data);
		
		Event.stop(e);
	}
});

/**
 * DevelHintClass
 */
var DevelHintClass = Class.create();
DevelHintClass.prototype = Object.extend(new DevelHint(),
{
	click: function(e)
	{	
		var el = e.target;
		
		var name = el.title;
		var data = {
			'docs': $(el).select('span[rel="docs"]')[0].innerHTML.evalJSON(),
			'this': $(el).select('span[rel="this"]')[0].innerHTML.evalJSON(),
			'vars': $(el).select('span[rel="vars"]')[0].innerHTML.evalJSON(),
			'methods': $(el).select('span[rel="methods"]')[0].innerHTML.evalJSON(),
			//'reflect': $(el).select('span[rel="reflect"]')[0].innerHTML.evalJSON()
		}

		DevelGlobals.PanelManager.get('dhmedia_devel_block_panel_docs').load(data.docs.url);

		var content = '';
		var editorIds = [];

		content += '<h1>Block XML</h1>';
		data.layout.each(function(layout){
			content += '<h2>' + layout.file + '</h2>';
			content += '<em>' + layout.path + '</em>';
			content += ' - <a target="devel-editor" href="' + layout.url 
				+ '" onclick="DevelGlobals.PanelManager.get(\'dhmedia_devel_block_panel_editor\').open();">Edit</a>';
			layout.xml.each(function(xml, i){

				xml = xml.replace(/\[\[/g, '<');
				xml = xml.replace(/\]\]/g, '>');
				xml = xml.replace(/\'\'/g, '"');

				var editorId = layout.file + '-' + i;
				
				content += '<textarea id="' + editorId +'">';
				content += xml;
				content += '</textarea>';

				editorIds.push(editorId);
			});
		});
		
		DevelGlobals.PanelManager.get('dhmedia_devel_block_panel_block').setContent(content);

		editorIds.each(function(editorId){
			CodeMirror.fromTextArea(document.getElementById(editorId), {
			    lineNumbers: true,
			    matchBrackets: true,
			    mode: "application/xml",
			    indentUnit: 8,
			    indentWithTabs: true,
			    enterMode: "keep",
			    tabMode: "shift",
			    //readOnly: true
			});
		});
		
		DevelGlobals.PanelManager.get('dhmedia_devel_block_panel_block').open();
		
		console.log('HINT BLOCK', name, data);
		
		Event.stop(e);
	}
});

/**
 * DevelHintTemplate
 */
var DevelHintTemplate = Class.create();
DevelHintTemplate.prototype = Object.extend(new DevelHint(),
{
	click: function(e)
	{	
		var el = e.target;
		
		var name = el.title;
		var data = {
			'fileinfo': $(el).select('span[rel="fileinfo"]')[0].innerHTML.evalJSON(),
			'editor': $(el).select('span[rel="editor"]')[0].innerHTML.evalJSON()
		}

		DevelGlobals.PanelManager.get('dhmedia_devel_block_panel_editor').open(data.editor.url);
		
		console.log('HINT TEMPLATE', name, data);
		
		Event.stop(e);
	}
});

/**
 * DevelHintKrumo
 */
var DevelHintKrumo = Class.create();
DevelHintKrumo.prototype = Object.extend(new DevelHint(),
{
	getData: function()
	{
		return $(this.dom).select('.devel-data-json')[0].innerHTML;
	},
	click: function(e)
	{	
		var el = e.target;
		
		var name = el.title;
		var data = {
			'fileinfo': $(el).select('span[rel="fileinfo"]')[0].innerHTML.evalJSON(),
			'editor': $(el).select('span[rel="editor"]')[0].innerHTML.evalJSON()
		}

		DevelGlobals.PanelManager.get('dhmedia_devel_block_panel_editor').open(data.editor.url);
		
		console.log('HINT TEMPLATE', name, data);
		
		Event.stop(e);
	}
});