<?php

class Dhmedia_Devel_CommandController extends Mage_Core_Controller_Front_Action
{
	protected $status = true;
	protected $contents = null;
	
	public function preDispatch()
	{
		/* Do auth checks here */
	}
	
	public function postDispatch()
	{
		if ($this->getRequest()->getParam('return'))
		{
			$this->_redirectUrl($this->getRequest()->getParam('return'));
		}
		else
		{
			$this->getResponse()->setHeader('Content-Type', 'application/json');
			
			echo json_encode(array(
				'status' => $this->status,
				'contents' => $this->contents
			));
		}
	}
	
	/* -----| Public actions/methods |----- */
	
	public function indexAction()
	{
		$this->status = false;
		$this->contents = "Method not implemented";
	}
	
	public function clearcacheAction()
	{
		Mage::app()->getCacheInstance()->flush();
	}
	
	public function reindexAction()
	{
		foreach(Mage::getResourceModel('index/process_collection') as $process) {
			$process->reindexEverything();
		}
	}
	
	public function hintsonAction()
	{
		$this->setHints(true);
	}
	
	public function hintsoffAction()
	{
		$this->setHints(false);
	}
	
	public function execphpAction()
	{
		$phpCode = $this->getRequest()->getParam('php');

		ob_start();
		
		$return = eval($phpCode);
		
		$this->contents = array(
			'output' => ob_get_clean(),
			'return' => $return
		);
	}
	
	/* -----| Protected LIB functions |----- */
	
	protected function setHints($status=true)
	{
		$groupArrayHints = $this->configStringToArray('debug.fields.template_hints.value', $status);
		$groupArrayHintsBlocks = $this->configStringToArray('debug.fields.template_hints_blocks.value', $status);
		
		$websiteId = Mage::app()->getWebsite()->getCode();
		$storeId = Mage::app()->getStore()->getCode();
		
		Mage::getModel('adminhtml/config_data')
			->setSection('dev')
			->setWebsite($websiteId)
			->setStore($storeId)
			->setGroups($groupArrayHints)
			->save();
			
		Mage::getModel('adminhtml/config_data')
			->setSection('dev')
			->setWebsite($websiteId)
			->setStore($storeId)
			->setGroups($groupArrayHintsBlocks)
			->save();
			
		return true;
	}
	
	protected function configStringToArray($dotSeparatedString, $value)
	{
		$array = array();
		$currentArrayPointer =& $array;
		
		$parts = explode('.', $dotSeparatedString);
		
		while($part = array_shift($parts)) {
			$currentArrayPointer[$part] = array();
			$currentArrayPointer =& $currentArrayPointer[$part];
		}
		
		$currentArrayPointer = $value;
		
		return $array;
	}
}