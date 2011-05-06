<?php

class Dhmedia_Devel_Model_File_Layout extends Dhmedia_Devel_Model_File_Abstract
{
	public function getType()
	{
		return 'layout';
	}
	
	public function getUseThemeError()
	{
		$localLink = Mage::getBaseUrl() . 'devel/filesystem/edit?' . http_build_query(array(
			'layout' => 'local.xml',
			'type' => 'layout'
		));
		return 'You must copy the file to your theme, or better yet, use <a href="' . $localLink . '">local.xml</a>!';
	}
	
	public function getDefaultContents()
	{
		$content  = '<?xml version="1.0" encoding="UTF-8"?>' . "\n";
		$content .= '<layout>' . "\n";
		$content .= "\t" . '<default>' . "\n";
		$content .= "\t\t\n";
		$content .= "\t" . '</default>' . "\n";
		$content .= '</layout>' . "\n";
		
		return $content;
	}
}