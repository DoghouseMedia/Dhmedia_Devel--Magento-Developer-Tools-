/**
 * DevelHint
 */
var DevelHint = Class.create();
DevelHint.prototype =
{
	initialize: function(selector)
	{
		this.selector = selector;
		this.clickListener = this.click.bindAsEventListener(this);

		$$(this.selector)
			.invoke('observe', 'click', this.clickListener); // add our observer
		$$(this.selector).each(function(el) {
			el.setStyle({cursor: 'pointer'});
		});
	},
	click: function(e)
	{	
		console.log(e.target);
		
		Event.stop(e);
	}
};

/**
 * DevelHintBlock
 */
var DevelHintBlock = Class.create();
DevelHintBlock.prototype = Object.extend(new DevelHint(),
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
			//'reflect': $(el).select('span[rel="reflect"]')[0].innerHTML.evalJSON(),
			'layout': $(el).select('span[rel="layout"]')[0].innerHTML.evalJSON(),
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