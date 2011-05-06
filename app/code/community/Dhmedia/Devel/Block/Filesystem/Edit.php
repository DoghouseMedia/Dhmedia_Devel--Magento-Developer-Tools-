<?php

class Dhmedia_Devel_Block_Filesystem_Edit extends Mage_Core_Block_Template
{
	//protected $errors = array();
	
	/**
	 * File
	 * 
	 * @var Dhmedia_Devel_Model_File_Template
	 */
	protected $file;
	
	protected function _construct()
	{
		$type = $this->getRequest()->getParam('type');
			
		$this->file = Mage::getModel('devel/file_' . $type,
			$this->getRequest()->getParam($type)
		);
		
		parent::_construct();
		$this->setTemplate('devel/filesystem/edit.phtml');
	}
	
	public function getShowTemplateHints()
	{
		return false;
	}
	
	public function getFile()
	{
		return $this->file;
	}
}