<?php

class Dhmedia_Devel_Block_Help_View extends Mage_Page_Block_Html
{
	protected function _construct()
	{	
		parent::_construct();
		
		$templateFile = 'devel/help/' . $this->getRequest()->getParam('topic', 'index') . '.phtml';
		
		$filePath = Mage::getDesign()->getTemplateFilename($templateFile);
		
		if (! file_exists($filePath)) {
			$templateFile = 'devel/help/notfound.phtml';
		}
		
		$this->setTemplate($templateFile);
	}
	
	public function getShowTemplateHints()
	{
		return false;
	}
	
	public function getHelpUrl($topic)
	{
		return $this->helper('devel/url')->getHelpUrl($topic);
	}
}