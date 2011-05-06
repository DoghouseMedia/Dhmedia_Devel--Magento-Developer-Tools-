<?php

class Dhmedia_Devel_Model_File_Template extends Dhmedia_Devel_Model_File_Abstract
{
	public function getType()
	{
		return 'template';
	}
	
	public function getUseThemeError()
	{
		return 'You must copy the file to your theme! <span style="color: #666;">Use the button below.</span>';
	}
	
	public function getDefaultContents()
	{
		$content  = '<?php' . "\n";
		$content .= "\n";
		$content .= "\n";
		$content .= '?>' . "\n";
		$content .= "\n";
		$content .= "<div>\n";
		$content .= "\n";
		$content .= "</div>\n";
		
		return $content;
	}
}